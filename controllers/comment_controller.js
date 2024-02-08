const Comment = require("../models/comment");
const Post = require("../models/post");
const User = require("../models/user");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const passport = require("passport");

exports.comment_get_all = asyncHandler(async (req, res) => {
  try {
    const post = await Post.findById(req.params.postid)
      .populate("comments")
      .exec();

    if (!post) {
      return res.sendStatus(404);
    }

    return res.status(200).json({ postsComments: post.comments });
  } catch (err) {
    console.error(err);
    return res.sendStatus(500);
  }
});

exports.comment_get_single = asyncHandler(async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentid)
      .populate("user")
      .exec();

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    return res.status(200).json(comment);
  } catch (err) {
    console.error(err);
    return res.sendStatus(500);
  }
});

exports.comment_create = [
  passport.authenticate("jwt", { session: false }),
  body("text")
    .trim()
    .isLength({ min: 10 })
    .withMessage("Content must be a minimum of 10 characters")
    .escape(),
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json(errors);
    }

    try {
      const post = await Post.findById(req.params.postid).exec();
      const user = await User.findById(post.user).exec();
      const newComment = new Comment({
        user: req.user.user.userid,
        text: req.body.text,
        parent: post.id,
      });

      if (!post) {
        return res.status(403).json({ message: "Post not found" });
      }

      if (!user) {
        return res.status(404).json({ message: "User not found}" });
      }

      user.comments.push(newComment);
      post.comments.push(newComment);
      await Promise.all([post.save(), newComment.save(), user.save()]);
      return res.status(200).json({ message: "Comment created" });
    } catch (err) {
      console.error(err);
      return res.sendStatus(500);
    }
  }),
];

exports.comment_patch = [
  passport.authenticate("jwt", { session: false }),
  asyncHandler(async (req, res) => {
    try {
      const comment = await Comment.findById(req.params.commentid)
        .populate("user")
        .exec();

      // not found
      if (!comment) {
        return res.status(404).json({ message: "Comment not found" });
      }

      const user = await User.findById(comment.user.id).exec();
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // request user does not match
      if (user.email !== req.user.email) {
        return res.sendStatus(403);
      }

      comment.text = req.body.text || comment.text;
      await comment.save();
      return res.status(200).json(comment);
    } catch (err) {
      console.error(err);
      return res.sendStatus(500);
    }
  }),
];

exports.comment_delete = [
  passport.authenticate("jwt", { session: false }),
  asyncHandler(async (req, res) => {
    try {
      const [comment, post] = await Promise.all([
        Comment.findById(req.params.commentid).populate("user").exec(),
        Post.findById(req.params.postid)
          .populate({
            path: "comments",
            select: "text",
          })
          .exec(),
      ]);

      // not found
      if (!comment || !post) {
        return res.sendStatus(404);
      }

      const user = await User.findById(comment.user.id)
        .populate({
          path: "comments",
          select: "text",
        })
        .exec();

      if (!user) return res.sendStatus(404);

      // protects comments from other user deleting or updating them
      if (!req.user.isAdmin || comment.user.email !== req.user.email) {
        return res.sendStatus(403);
      }

      post.comments = post.comments.filter(
        (comment) => comment.id !== req.params.postid
      );

      user.comments = user.comments.filter(
        (comment) => comment.id !== req.params.commentid
      );

      await Promise.all([
        user.save(),
        post.save(),
        Comment.findByIdAndDelete(req.params.commentid),
      ]);

      return res.status(200).json({ comment, post });
    } catch (err) {
      console.error(err);
      return res.sendStatus(500);
    }
  }),
];
