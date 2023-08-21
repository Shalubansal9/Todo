const mongoose = require("mongoose");

//create schema
const userSchema = new mongoose.Schema({
    username: String,
    password: String,
    email: String,
    uid: String,
});
//table name is user
const User = mongoose.model("User", userSchema);
module.exports = User;