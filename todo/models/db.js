const mongoose = require('mongoose');

module.exports.init = async function()
{
    await mongoose.connect('mongodb+srv://todo:C1IGKFjF5DBBsoP0@cluster0.bzpu2gs.mongodb.net/todo?retryWrites=true&w=majority');
}