const Comment = require("../models/comment");
const Post = require("../models/post");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");

exports.comment_get_all = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.postid)
    .populate("comments")
    .exec();

  res.status(200).json(post.comments);
});

exports.comment_get_single = asyncHandler(async (req, res) => {
  const comment = await Comment.findById(req.params.commentid).exec();

  res.json(comment);
});

exports.comment_create = asyncHandler(async (req, res) => {
  try {
    const post = await Post.findById(req.params.postid);

    const newComment = new Comment({
      author: req.body.author,
      text: req.body.text,
      parent: req.params.postid,
    });

    post.comments.push(newComment);

    await Promise.all([post.save(), newComment.save()]);

    res.status(200).json(post);
  } catch (err) {
    res.sendStatus(500);
  }
});

exports.comment_patch = asyncHandler(async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentid);

    if (!comment) {
      res.status(404).json({ message: "Comment not found" });
    }

    comment.author = req.body.author || comment.author;
    comment.text = req.body.text || comment.text;

    comment.save();
    res.status(200).json(comment);
  } catch (err) {
    res.status(500).json(err);
  }
});

exports.comment_delete = asyncHandler(async (req, res) => {
  res.json({
    message: "Not implemented yet",
  });
});
