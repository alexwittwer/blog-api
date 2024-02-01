const Comment = require("../models/comment");
const Post = require("../models/post");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const passport = require("passport");

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
    console.error(err);
    res.status(500);
  }
});

exports.comment_create = [
  passport.authenticate("jwt", { session: false }),
  body("text")
    .trim()
    .isLength({ min: 150 })
    .withMessage("Content must be a minimum of 20 characters")
    .escape(),
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: "Could not post due to validation errors",
        err: errors,
      });
    }

    try {
      const post = await Post.findById(req.params.postid).exec();
      const newComment = new Comment({
        user: req.body.user,
        text: req.body.text,
        parent: post._id,
      });

      if (!post) {
        res.status(403).json({ message: "Post not found" });
      } else {
        post.comments.push(newComment);
        await Promise.all([post.save(), newComment.save()]);
        res.status(200).json(post);
      }
    } catch (err) {
      console.error(err);
      res.sendStatus(500);
    }
  }),
];

exports.comment_patch = [
  passport.authenticate("jwt", { session: false }),
  asyncHandler(async (req, res) => {
    try {
      const comment = await Comment.findById(req.params.commentid).populate(
        "user"
      );

      if (comment.user.email !== req.user.email) {
        return res.status(403);
      }

      if (!comment) {
        res.status(404).json({ message: "Comment not found" });
      } else {
        comment.text = req.body.text || comment.text;

        await comment.save();
        res.status(200).json(comment);
      }
    } catch (err) {
      console.error(err);
      res.status(500);
    }
  }),
];

exports.comment_delete = [
  passport.authenticate("jwt", { session: false }),
  asyncHandler(async (req, res) => {
    try {
      const [comment, post] = await Promise.all([
        Comment.findByIdAndDelete(req.params.commentid),
        Post.findById(req.params.postid),
      ]);

      if (comment.user.email !== req.user.email) {
        return res.status(403);
      }

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
      console.error(err);
      res.sendStatus(500);
    }
  }),
];
