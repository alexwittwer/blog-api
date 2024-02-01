const Post = require("../models/post");
const User = require("../models/user");
const Comment = require("../models/comment");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const passport = require("passport");

exports.post_get_all = asyncHandler(async (req, res) => {
  try {
    const allPosts = await Post.find()
      .populate({
        path: "comments",
        select: "text",
      })
      .populate({
        path: "user",
        select: "name",
      })
      .exec();

    if (!allPosts) {
      res.status(404).json({ message: "No posts found" });
    } else {
      res.json(allPosts);
    }
  } catch (err) {
    console.error(err);
    res.status(500);
  }
});

exports.post_get_single = asyncHandler(async (req, res) => {
  try {
    const singlePost = await Post.findById(req.params.postid)
      .populate({
        path: "comments",
        select: "text",
      })
      .populate({
        path: "user",
        select: "name posts",
      })
      .exec();

    if (!singlePost) {
      res.status(404).json({ message: "Post not found" });
    } else {
      res.json(singlePost);
    }
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

exports.post_create = [
  passport.authenticate("jwt", { session: false }),
  body("title")
    .trim()
    .isLength({ min: 6 })
    .withMessage("Titles must be 6 characters minimum")
    .escape(),
  body("text")
    .trim()
    .isLength({ min: 150 })
    .withMessage("Content must be a minimum of 150 characters")
    .escape(),

  asyncHandler(async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: "Could not post due to validation errors",
        err: errors,
      });
    }

    const newPost = new Post({
      title: req.body.title,
      user: req.body.user,
      text: req.body.text,
    });
    const user = await User.findById(req.body.user);

    try {
      user.posts.push(newPost);
      await Promise.all([newPost.save(), user.save()]);
      res.status(201).json(newPost);
    } catch (err) {
      console.error(err);
      res.sendStatus(500);
    }
  }),
];

exports.post_patch = [
  passport.authenticate("jwt", { session: false }),
  asyncHandler(async (req, res) => {
    try {
      const post = await Post.findById(req.params.postid).populate("user");

      if (post.user.email !== req.user.email) {
        return res.status(403);
      }

      if (!post) {
        res.status(404).json({ message: "Post not found" });
      }

      post.title = req.body.title || post.title;
      post.text = req.body.text || post.text;

      await post.save();
      res.status(200).json(post);
    } catch (err) {
      console.error(err);
      res.status(500).json(err);
    }
  }),
];

exports.post_delete = [
  passport.authenticate("jwt", { session: false }),
  asyncHandler(async (req, res) => {
    try {
      const [post, allComments] = await Promise.all([
        Post.findById(req.params.postid).exec(),
        Comment.find({ parent: req.params.postid }).exec(),
      ]);

      if (post.user.email !== req.user.email) {
        return res.status(403);
      }

      if (!post) {
        res.status(404).json({ message: "Post not found" });
      } else {
        const user = await User.findById(post.user);

        user.posts = user.posts.filter(
          (userPost) => userPost._id.toString() !== post._id.toString()
        );

        await Promise.all([
          allComments.map(async (comment) => {
            await Comment.findByIdAndDelete(comment.id);
          }),
          user.save(),
          Post.findByIdAndDelete(req.params.postid),
        ]);
        return res.json(post);
      }
    } catch (err) {
      console.error(err);
      res.sendStatus(500);
    }
  }),
];
