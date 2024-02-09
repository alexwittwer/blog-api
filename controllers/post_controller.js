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
      .sort("-date")
      .exec();

    if (!allPosts) {
      return res.status(404).json({ message: "No posts found" });
    }

    return res.status(200).json(allPosts);
  } catch (err) {
    console.error(err);
    return res.sendStatus(500);
  }
});

exports.post_get_single = asyncHandler(async (req, res) => {
  try {
    const singlePost = await Post.findById(req.params.postid)
      .populate({
        path: "comments",
        populate: {
          path: "user",
          select: "name",
        },
        select: "user text",
      })
      .populate({
        path: "user",
        select: "name posts",
      })
      .exec();

    if (!singlePost) {
      return res.status(404).json({ message: "Post not found" });
    }

    return res.status(200).json(singlePost);
  } catch (err) {
    console.error(err);
    return res.sendStatus(500);
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
    .isLength({ min: 300 })
    .withMessage("Content must be a minimum of 300 characters"),
  body("lede")
    .trim()
    .isLength({ max: 100 })
    .withMessage("Lede must be under 100 characters")
    .escape(),

  asyncHandler(async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json(errors);
    }

    try {
      const newPost = new Post({
        title: req.body.title,
        user: req.user.user.userid,
        text: req.body.text,
        lede: req.body.lede,
      });

      const user = await User.findById(req.user.user.userid);

      user.posts.push(newPost);
      await Promise.all([newPost.save(), user.save()]);
      return res.status(201).json({ message: "Post created", id: newPost.id });
    } catch (err) {
      console.error(err);
      return res.sendStatus(500);
    }
  }),
];

exports.post_patch = [
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
      return res.status(400).json(errors);
    }

    try {
      const post = await Post.findById(req.params.postid).populate("user");

      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }

      // protects comments from other user deleting or updating them
      if (post.user.email !== req.user.email) {
        return res.sendStatus(403);
      }

      post.title = req.body.title || post.title;
      post.text = req.body.text || post.text;
      post.lede = req.body.lede || post.lede;

      await post.save();
      return res.status(200).json({ message: "Post updated" });
    } catch (err) {
      console.error(err);
      return res.sendStatus(500);
    }
  }),
];

exports.post_delete = [
  passport.authenticate("jwt", { session: false }),
  asyncHandler(async (req, res) => {
    try {
      const [post, allComments] = await Promise.all([
        Post.findById(req.params.postid).populate("user").exec(),
        Comment.find({ parent: req.params.postid }).exec(),
      ]);

      const user = await User.findById(post.user);

      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // protects comments from other user deleting or updating them
      if (!(req.user.user.isAdmin || post.user.email === req.user.email)) {
        console.error("User email does not match");
        return res.sendStatus(403);
      }

      user.posts = user.posts.filter(
        (userPost) => userPost.id.toString() !== post.id.toString()
      );

      await Promise.all([
        allComments.map(async (comment) => {
          await Comment.findByIdAndDelete(comment.id);
        }),
        user.save(),
        Post.findByIdAndDelete(req.params.postid),
      ]);
      return res.status(200).json({ message: "Post deleted successfully" });
    } catch (err) {
      console.error(err);
      return res.sendStatus(500);
    }
  }),
];
