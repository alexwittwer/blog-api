const Post = require("../models/post");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");

exports.post_get_all = asyncHandler(async (req, res) => {
  const allPosts = await Post.find().populate("comments").exec();

  res.json(allPosts);
});

exports.post_get_single = asyncHandler(async (req, res) => {
  try {
    const singlePost = await Post.findById(req.params.postid)
      .populate("comments")
      .exec();

    if (singlePost != null) {
      res.json(singlePost);
    } else {
      res.sendStatus(404);
    }
  } catch (err) {
    res.sendStatus(500);
  }
});

exports.post_create = asyncHandler(async (req, res) => {
  const newPost = new Post({
    title: req.body.title,
    author: req.body.author,
    text: req.body.text,
  });

  try {
    await newPost.save();
    res.status(201).json(newPost);
  } catch (err) {
    res.sendStatus(400);
  }
});

exports.post_patch = asyncHandler(async (req, res) => {
  try {
    const post = await Post.findById(req.params.postid);

    if (!post) {
      res.status(404).json({ message: "Post not found" });
    }

    post.title = req.body.title || post.title;
    post.text = req.body.text || post.text;

    post.save();
    res.status(200).json(post);
  } catch (err) {
    res.status(500).json(err);
  }
});

exports.post_delete = asyncHandler(async (req, res) => {
  try {
    const post = await Post.findByIdAndDelete(req.params.postid);
    if (post !== null) {
      res.json(post);
    } else {
      res.sendStatus(404);
    }
  } catch (err) {
    res.sendStatus(500);
  }
});
