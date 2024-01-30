const mongoose = require("mongoose");

const CommentSchema = new mongoose.Schema({
  author: { type: String, required: true, default: "Anonymous" },
  text: { type: String, required: true },
  parent: { type: mongoose.Schema.Types.ObjectId, ref: "Post" },
});

module.exports = mongoose.model("Comment", CommentSchema);
