const express = require('express');
const fs = require("fs");
const app = express();         //instance
const uuid = require("uuid");     //generate unique identifiers (UUIDs)
const session = require('express-session');

app.set("view engine", "ejs");

app.use(session({
    secret: 'dont know',
    resave: false,
    saveUninitialized: true,
}));

//middleware, automatically parses the JSON data sent in the request body and attaches it to the req.body object
app.use(express.json());
app.use(function(req, res, next){
    console.log(req.method, req.url);
    next();
});


app.use(express.static(__dirname + '/views'));
app.use(express.urlencoded({ extended: true })); //without this, getting form data is undefined

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
        //res.redirect("/login");
        res.redirect("login");
        return;
    }
    res.render("todo", { username: req.session.username });
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
    //res.sendFile(__dirname + "/public/signup.html");
    //res.render("signup",{successmsg: null});
    res.render("signup");
});


app.post("/todo", function (req, res) {
    const uid = uuid.v4();
    req.body["uid"] = uid;  //add new property= id to request body
    //console.log(req.body);
    //to write fetched data into the file
    // if(!req.session.isLoggedIn){                    //session in post request
    //     res.status(401).send("error");
    //     return;
    // }
    saveTodos(req.body, function (err) {
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
            res.render("todo", {username: user.username});
            //res.render("todo", {username: "Shalu"});
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


app.listen(4000, function () {
    console.log("Server on port 4000");
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


app.post("/signup", function (req, res) {
    //to write fetched data into the file
    saveUserData(req.body, function (err) {
        if (err) {
            res.status(500).send("error");
            return;
        }
        res.status(200).json("success");
        //res.render( "signup",{successmsg: "Account created Successfully..! Please Login"})   
    });
});

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
