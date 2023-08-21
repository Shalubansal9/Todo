const express = require('express');
const fs = require("fs");
const app = express();         //instance
const db = require("./models/db");
const UserModel = require("./models/User");
const TodoModel = require('./models/Todo');
const uuid = require("uuid");     //generate unique identifiers (UUIDs)
const session = require('express-session');
//multer handle multipart(multimedia) form data
const multer = require("multer");
const upload = multer({dest: "uploads/"});

app.set("view engine", "ejs");
app.use(session({
    secret: 'dont know',
    resave: false,
    saveUninitialized: true,
}));

//middleware, automatically parses the JSON data sent in the request body and attaches it to the req.body object
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(upload.single("image")); 
app.use(express.static(__dirname + '/'));
app.use(express.static(__dirname + '/views'));
app.use(function (req, res, next) {
    console.log(req.method, req.url);
    next();
});


app.get("/", function (req, res) {
    res.render("index");
});
app.get("/contact", function (req, res) {
    res.render("contact");
});
app.get("/about", function (req, res) {
    res.render("about");
});
app.get("/todo", function (req, res) {
    if (!req.session.isLoggedIn) {         //session in get request
        res.redirect("login");
        return;
    }
    //console.log("Todos:", todos);
    res.render("todo", { username: req.session.username});
});
app.get("/todoScript.js", function (req, res) {
    res.sendFile(__dirname + "/todoScript.js");
});
app.get("/todo-data", function (req, res) {
    TodoModel.find()
    .then(function(todos){
        res.status(200).json(todos);
    }).catch(function(err){
        res.status(500).json({ error: "Something went wrong" });
    });
});
app.get("/login", function (req, res) {
    //res.sendFile(__dirname + "/public/login.html");
    res.render("login", { error: null });
});
app.get("/signup", function (req, res) {
    //res.render("signup",{successmsg: null});
    res.render("signup");
});


app.post("/todo", function (req, res) {
    const addTask = req.body.addTask;
    const image = req.file;
    const imagePath = `/uploads/${image.filename}`;
    //console.log(addTask, image, imagePath);

    const todo = {
        addTask,
        "completed": false,
        imagePath,
        uid: uuid.v4(),
    }
    
    const uid = uuid.v4();
    todo["uid"] = uid;  //add new property= id to todo

    TodoModel.create(todo)
    .then(function (){
        res.status(200).json(todo);
    })
    .catch(function(err){
        res.render("todo",{error: err});
    });
});
app.post("/todo-complete", function (req, res) {

    const uid = req.body.uid;
    TodoModel.findOneAndUpdate({ uid }, { completed: true })
    .then(function (todo) {
        if (!todo) {
            console.log("Todo not found");
            res.status(404).send("Todo not found");
            return;
        }
        console.log("Completed todo:", todo);
        res.status(200).json(todo);
    })
    .catch(function (err) {
        console.error("Error deleting todo:", err);
        res.status(500).send("Error deleting todo.");
    });
    
    
});
app.post("/delete-todo", function (req, res) {

    const uid = req.body.uid;
    console.log("Received delete request for UID:", uid);
    TodoModel.findOneAndDelete({ uid })
    .then(function (todo) {
        if (!todo) {
            console.log("Todo not found");
            res.status(404).send("Todo not found");
            return;
        }
        console.log("Deleted todo:", todo);
        res.status(200).json(todo);
    })
    .catch(function (err) {
        console.error("Error deleting todo:", err);
        res.status(500).send("Error deleting todo.");
    });
    
});
app.post("/signup", function (req, res) {

    UserModel.create(req.body)
    .then(function (){
        res.redirect("/login");
    })
    .catch(function(err){
        res.render("signup",{error: err});
    });
});
app.post("/login", function (req, res) {
    const username = req.body.username;
    const userpassword = req.body.password;
    console.log(username, userpassword);     //data when user login


    UserModel.findOne({username: username, password: userpassword})
    .then(function(user){
        if(user){
            req.session.isLoggedIn = true;
            req.session.username = username;
            
            res.redirect("/todo");
            return;
        }
        res.render("login", { error: "invalid username or password" });
    }).catch(function(err){
        res.render("login", { error: "something wrong" });
    });

});


db.init().then(function() {
    console.log("db connected");

    app.listen(5000, function () {
        console.log("Server on port 5000");
    });
}).catch(function (err){
    console.log(err);
});


app.get("/logout", function (req, res) {
    req.session.isLoggedIn = false;
    res.redirect("/");
});
