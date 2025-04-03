const mongoose = require("mongoose");
const postsSchema = new mongoose.Schema({
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    text:{
        type: String,
        required: true,
    },
    image:{
        type: String, // store image URL or path
        default:"",
    },
    likes:[{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    comments:[{
        user:{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        text:{
            type: String,
            required: true,
        },
        createdAt:{
            type: Date,
            default: Date.now,
        },
    }],
    createdAt:{
        type: Date,
        default: Date.now,
    },
});


module.exports = mongoose.model("Post", postsSchema);