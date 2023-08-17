const express = require('express');
const fs = require("fs");
const app = express();         //instance
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


 //without this, getting form data is undefined
//for single pic single for multiple pic array
    //name used in form field


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
    readTodos(function (err, data) {
        if (err) {
            res.status(500).send("error");
            return;
        }
        res.status(200).json(data);    
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
    console.log(addTask, image, imagePath);

    const todo = {
        addTask,
        "completed": false,
        imagePath,
    }
    
    const uid = uuid.v4();
    todo["uid"] = uid;  //add new property= id to todo

    //console.log(req.body);
    //to write fetched data into the file
    // if(!req.session.isLoggedIn){                    //session in post request
    //     res.status(401).send("error");
    //     return;
    // }
    saveTodos(todo, function (err) {
        if (err) {
            res.status(500).send("error");
            return;
        }
        res.status(200).json(req.body);
    });
});
app.post("/todo-complete", function (req, res) {
    readTodos(function (err, data) {
        if (err) {
            res.status(500).send("error");    //internal server error
            return;
        }
        todo = req.body;    //updates stored in todo
        let t = data.find(e => e.uid === todo.uid);  //find or match the specific id
        t.completed = true;
        fs.writeFile("mydata.json", JSON.stringify(data), function (err) {    
            if (err) {
                res.status(500).send("error");
                return;
            }
            res.status(200).send("success");
        });
    });
});
app.post("/delete-todo", function (req, res) {
    readTodos(function (err, data) {
        if (err) {
            res.status(500).send("error");
            return;
        }
        todo = req.body;
        let rd = data.filter(e => e.uid != todo.uid);    //filter creates new arrray
        fs.writeFile("mydata.json", JSON.stringify(rd), function (err) {         
            if (err) {
                res.status(500).send("error");
                return;
            }
            res.status(200).send("success");
        });
    });
});
app.post("/signup", function (req, res) {
    //to write fetched data into the file
    saveUserData(req.body, function (err) {
        if (err) {
            res.status(500).send("error");
            return;
        }
        res.status(200).json("success");   
    });
});
app.post("/login", function (req, res) {
    const username = req.body.username;
    const userpassword = req.body.password;
    console.log(username, userpassword);     //data when user login

    readUsers(function (err, data) {
        if (err) {
            res.status(500).send("error");
            return;
        }
        const user = data.find((user) => user.username === username && user.password === userpassword);
        if (user) {
            req.session.isLoggedIn = true;
            //res.render("todo", { username: user.username });
            req.session.username = username;
            res.status(200).redirect("/todo");
        }
        else if (data.some((user) => user.username === username && user.password != userpassword)) {
            //res.status(401).json({ error: "Incorrect password." });
            res.render("login", { error: "invalid password" })
        }
        else {
            res.render("login", { error: "plz register" });
        }
    });
});


app.listen(5000, function () {
    console.log("Server on port 5000");
});


//to read fetched data into the file
function readTodos(callback) {
    fs.readFile("mydata.json", "utf-8", function (err, data) {
        if (err) {
            callback(err);
            return;
        }
        if (data.length === 0) {
            data = "[]";      // represents an empty JSON array
        }
        try {
            data = JSON.parse(data);    //convert string to object
            callback(null, data);
        }
        catch (err) {
            callback(err);
        }
    });
}

//to save data into the file
function saveTodos(todo, callback) {
    readTodos(function (err, data) {
        if (err) {
            callback(err);
            return;
        }
        data.push(todo);
        fs.writeFile("mydata.json", JSON.stringify(data), function (err) {
            if (err) {
                callback(err);
                return;
            } else {
                callback(null);
            }
        });
    });
}


function saveUserData(userDetails, callback) {
    readUsers(function (err, data) {
        if (err) {
            callback(err);
            return;
        }
        const userExist = data.find((user) => user.email === userDetails.email);        //
        if (userExist) {
            callback("user already exist");
            return;
        }
        data.push(userDetails);
        fs.writeFile("userdata.json", JSON.stringify(data), function (err) {
            if (err) {
                callback(err);
                return;
             } else {
                callback(null);
            }
        });

    });
}

function readUsers(callback) {
    fs.readFile("userdata.json", "utf-8", function (err, data) {
        if (err) {
            callback(err);
            return;
        }
        if (data.length === 0) {
            data = "[]";                // represents an empty JSON array
        }
        try {
            data = JSON.parse(data);    //convert string to object
            callback(null, data);
        }
        catch (err) {
            callback(err);
        }
    });
}

app.get("/logout", function (req, res) {
    req.session.isLoggedIn = false;
    res.redirect("/");
});
