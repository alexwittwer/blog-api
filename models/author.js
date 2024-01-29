const mongoose = require("mongoose");

const AuthorSchema = new mongoose.Schema({
  name: { type: String, default: "Anonymous" },
  posts: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
    },
  ],
  comments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
    },
  ],
  joinDate: { type: Date },
  bio: { type: String },
});

AuthorSchema.virtual("postCount").get(function () {
  return this.comments.length;
});

module.exports = mongoose.model("Author", AuthorSchema);
