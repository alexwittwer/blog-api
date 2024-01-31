const mongoose = require("mongoose");
const User = require("../models/user");

const CommentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: "Anonymous",
  },
  text: { type: String, required: true },
  parent: { type: mongoose.Schema.Types.ObjectId, ref: "Post" },
});

module.exports = mongoose.model("Comment", CommentSchema);
