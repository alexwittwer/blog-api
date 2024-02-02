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

    return res.json(comment);
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
      return res.status(400).json({
        message: "Could not post due to validation errors",
        err: errors,
      });
    }

    try {
      const post = await Post.findById(req.params.postid).exec();
      const user = await User.findById(post.user).exec();
      console.log(req.user);
      const newComment = new Comment({
        user: req.user.user.userid,
        text: req.body.text,
        parent: post._id,
      });

      user.comments.push(newComment);

      if (!post) {
        return res.status(403).json({ message: "Post not found" });
      }

      post.comments.push(newComment);
      await Promise.all([post.save(), newComment.save(), user.save()]);
      return res.status(200).json(newComment);
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
      const user = await User.findById(comment.user._id).exec();

      // not found
      if (!comment) {
        return res.status(404).json({ message: "Comment not found" });
      }

      // request user does not match
      if (user.email !== req.user.email) {
        return res.status(403).send();
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
        Post.findById(req.params.postid).exec(),
      ]);

      // not found
      if (comment === null || post === null) {
        return res.status(404);
      }

      // protects comments from other user deleting or updating them
      if (comment.user.email !== req.user.email) {
        return res.status(403);
      }

      post.comments = post.comments.filter(
        (postComment) => postComment._id !== comment._id
      );
      await post.save();
      await Comment.findByIdAndDelete(req.params.commentid);
      return res.json(comment);
    } catch (err) {
      console.error(err);
      return res.status(500);
    }
  }),
];
