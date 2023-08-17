const submitTask = document.getElementById("add-task-button");
const inputTask = document.getElementById("input-task");
const todoList = document.getElementById("task-list");
const showusername = document.getElementById("showusername");
const inputImage = document.getElementById("input-img");

//signup
const register = document.querySelector(".register");
const userName = document.getElementById("inputName");
const userPassword = document.getElementById("inputPass");
const cnfrmPassword = document.getElementById("inputCnfrmPass");
const userEmail = document.getElementById("inputEmail");

//login
const loginBtn = document.querySelector(".submit");
const loginName = document.getElementById("loginname");
const loginPass = document.getElementById("loginpass");


submitTask.addEventListener("click", function (e) {
    e.preventDefault();                //prevent page refresh
    const addTask = inputTask.value;  //for getting input
    const image = inputImage.value;
    
    if (!addTask) {                    //if input is empty
        alert("please enter todo");
        return;
    }
    
    const todo = {
        //if key and value are same in object 
        addTask,                   //holds the value entered by the user
        "completed": false,
        "imagePath": image,
    }

    const formData = new FormData();
    formData.append('addTask', todo.addTask);
    formData.append('image', document.querySelector('#input-img').files[0]);
    
    inputTask.value = "";
    inputImage.value="";

    fetch("/todo", {                  //fetch API call to send the todo object to the server
        method: "POST",
        // headers: {
        //     "Content-Type": "application/json",
        // },
        // body: JSON.stringify(todo),    //convert object into json
        body:formData,
    })
        .then(function (response) {             //promise to handle the response from the server
            if (response.status === 200) {      //successfull response
                showTodo(todo);
            } //else if (response.status === 401) {
            //     alert("Please Login First..!");
            //     //window.location.href = "/login";
            // }
            else {
                alert("something wrong");
            }
        });
});

//show todo in ui
function showTodo(todo) {

    const todoListItem = document.createElement("div");
    todoListItem.className = "listItem";
    todoList.appendChild(todoListItem);

    const text = document.createElement("div");
    text.style.display = "contents";
    text.innerText = todo.addTask;    // assign addTask item from todo object in text element
    todoListItem.appendChild(text);

    const span = document.createElement("span");
    todoListItem.appendChild(span);

    //image
    const image = document.createElement("img");
    image.className="inputimage";
    const imagePath = todo.imagePath;          
    image.src = imagePath;
    span.appendChild(image);

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.classList.add("check-button");
    span.appendChild(checkbox);

    checkbox.checked = todo.completed;
    if (todo.completed) {
        checkbox.disabled = true;
        text.innerHTML = text.innerText.strike();
    }

    checkbox.addEventListener("click", function (e) {
        todo.completed = true;
        fetch("/todo-complete", {          //fetch API call to send the updated todo object to the server
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(todo)
        })
    .then(function (response) {
            if (response.status === 200) {
                console.log("successfully completed");
                text.innerHTML = text.innerText.strike();
                checkbox.disabled = true;
            }
            else {
                console.log("Something went wrong");
            }
        }).catch(function (error) {
            console.error("Error:", error); // Handle fetch-related errors
        });
    });


    const deleteButton = document.createElement("button");
    deleteButton.innerText = "x";
    deleteButton.classList.add("delete-button");
    span.appendChild(deleteButton);


    deleteButton.addEventListener("click", function (e) {
        //console.log(todoListItem.innerText);
        fetch("/delete-todo", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(todo)
        }).then(function (response) {
            if (response.status === 200) {
                // todoNode.innerHTML="";
                todoList.removeChild(todoListItem);
            }
            else {
                console.log("Something went wrong");
            }
        });
    }); 
}

//fetch API call that retrieves a list of todos from the server and then processes the response data to display each todo on the web page using the showTodo function
fetch("/todo-data")
    .then(function (response) {
        if (response.status === 200) {
            return response.json();         //text to json
        } else {
            alert("something weird happened");
        }
    })
    .then(function (todos) {        //todos to htmlcontent
        todos.forEach(function (todo) {
            showTodo(todo);
        }); 
    });


register.addEventListener("click", function (e) {
    e.preventDefault();
    const username = userName.value;
    const userpass = userPassword.value;
    const usercnfrmpass = cnfrmPassword.value;
    const useremail = userEmail.value;

    if (userpass !== usercnfrmpass) {
        alert("Passwords do not match");
        return;
    }

    // if (!username || !userpass || !useremail) {                    //if input is empty
    //     alert("All the details are required");
    //     return;
    // }

    const userDetails = {
        username,
        userpass,
        useremail,
    }

    fetch("/signup", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(userDetails),     //object to json
    }).then(function (response) {             //promise to handle the response from the server
        if (response.status === 200) {      //successfull response
            //console.log(userDetails);
            alert("Signup successful. Please login.");
        }
        else if (response.status === 500) {
            alert("User already Exist, Please Login to Continue..");
        }
        else {
            alert("something wrong");
        }
    }).catch(function (error) {
        alert("Something went wrong.");
    });
});

loginBtn.addEventListener("click", function (e) {
    e.preventDefault();
    const loginname = loginName.value;
    const loginpass = loginPass.value;
    //console.log(loginname, loginpass);

    const loginDetails = {
        loginname,
        loginpass,
    }

    loginName.value = "";
    loginPass.value = "";

    fetch("/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(loginDetails),     //object to json
    }).then(function (response) {             //promise to handle the response from the server
        if (response.redirected) {      //successfull response
            console.log("login successfull");
            //return response.json();
        }
        else if (response.status === 401) {        //401 is unauthorized
            response.json().then((data) => {
                if (data.error === "Incorrect password.") {
                    alert("Incorrect password. Please try again.");
                } else {
                    alert("User not found. Please sign up.");
                }
            });
        }
        else {
            alert("something wrong");
        }
    }).catch(function (error) {
        alert("Something went wrong.");
    });
});







