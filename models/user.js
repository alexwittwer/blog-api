const mongoose = require("mongoose");
const Post = require("../models/post");
const Comment = require("../models/comment");

const UserSchema = new mongoose.Schema({
  name: { type: String, default: "Anonymous" },
  posts: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Posts",
    },
  ],
  comments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
    },
  ],
  email: { type: String, required: true },
  joinDate: { type: Date, default: Date.now },
  bio: { type: String },
  isAdmin: { type: Boolean, default: false },
});

UserSchema.virtual("postCount").get(function () {
  return this.comments.length;
});

module.exports = mongoose.model("User", UserSchema);
