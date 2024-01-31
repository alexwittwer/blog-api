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
  try {
    const comment = await Comment.findById(req.params.commentid).exec();

    if (!comment) {
      res.status(404).json({ message: "Comment not found" });
    } else {
      res.json(comment);
    }
  } catch (err) {
    res.status(500).json({ message: err });
  }
});

exports.comment_create = asyncHandler(async (req, res) => {
  try {
    const post = await Post.findById(req.params.postid);

    const newComment = new Comment({
      user: req.body.user,
      text: req.body.text,
      parent: req.params.postid,
    });
    if (!post) {
      res.status(403).json({ message: "Post not found" });
    } else {
      post.comments.push(newComment);
      await Promise.all([post.save(), newComment.save()]);
      res.status(200).json(post);
    }
  } catch (err) {
    res.sendStatus(500);
  }
});

exports.comment_patch = asyncHandler(async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentid);

    if (!comment) {
      res.status(404).json({ message: "Comment not found" });
    } else {
      comment.user = req.body.user || comment.user;
      comment.text = req.body.text || comment.text;

      await comment.save();
      res.status(200).json(comment);
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

exports.comment_delete = asyncHandler(async (req, res) => {
  try {
    const [comment, post] = await Promise.all([
      Comment.findByIdAndDelete(req.params.commentid),
      Post.findById(req.params.postid),
    ]);

    if (comment !== null) {
      post.comments = post.comments.filter(
        (postComment) => postComment._id !== comment._id
      );
      await post.save();
      res.json(comment);
    } else {
      res.sendStatus(404);
    }
  } catch (err) {
    res.sendStatus(500);
  }
});
