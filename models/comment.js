const mongoose = require("mongoose");
const User = require("../models/user");
const Post = require("../models/post");

const CommentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  text: { type: String, required: true },
  parent: { type: mongoose.Schema.Types.ObjectId, ref: "Post" },
});

module.exports = mongoose.model("Comment", CommentSchema);
