const mongoose = require("mongoose");

//create schema
const todoSchema = new mongoose.Schema({
    addTask: String,
    completed: Boolean,
    imagePath: String,
    uid: String,
});
//table name is user
const Todo = mongoose.model("Todo", todoSchema);
module.exports = Todo;