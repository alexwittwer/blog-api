const Post = require("../models/post");
const User = require("../models/user");
const Comment = require("../models/comment");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const passport = require("passport");

exports.post_get_all = asyncHandler(async (req, res) => {
  try {
    const allPosts = await Post.find().populate("comments").exec();

    if (!allPosts) {
      res.status(404).json({ message: "No posts found" });
    } else {
      res.json(allPosts);
    }
  } catch (err) {
    res.status(500).json({ message: err });
  }
});

exports.post_get_single = asyncHandler(async (req, res) => {
  try {
    const singlePost = await Post.findById(req.params.postid)
      .populate("comments")
      .exec();

    if (!singlePost) {
      res.status(404).json({ message: "Post not found" });
    } else {
      res.json(singlePost);
    }
  } catch (err) {
    res.sendStatus(500);
  }
});

exports.post_create = [
  passport.authenticate("jwt", { session: false }),
  asyncHandler(async (req, res) => {
    // TODO add validation and sanitization
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
      res.sendStatus(500);
    }
  }),
];

exports.post_patch = asyncHandler(async (req, res) => {
  try {
    const post = await Post.findById(req.params.postid);

    if (!post) {
      res.status(404).json({ message: "Post not found" });
    }

    post.title = req.body.title || post.title;
    post.text = req.body.text || post.text;

    await post.save();
    res.status(200).json(post);
  } catch (err) {
    res.status(500).json(err);
  }
});

exports.post_delete = asyncHandler(async (req, res) => {
  try {
    const [post, allComments] = await Promise.all([
      Post.findByIdAndDelete(req.params.postid).exec(),
      Comment.find({ parent: req.params.postid }).exec(),
    ]);

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
      ]);
      await user.save();
      return res.json(post);
    }
  } catch (err) {
    res.sendStatus(500);
  }
});
