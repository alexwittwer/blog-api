const Post = require("../models/post");
const Comment = require("../models/comment");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");

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

exports.post_create = asyncHandler(async (req, res) => {
  // TODO add validation and sanitization
  const newPost = new Post({
    title: req.body.title,
    author: req.body.author,
    text: req.body.text,
  });

  try {
    await newPost.save();
    res.status(201).json(newPost);
  } catch (err) {
    res.sendStatus(500);
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
      allComments.map(async (comment) => {
        await Comment.findByIdAndDelete(comment.id);
      });
      res.json(post);
    }
  } catch (err) {
    res.sendStatus(500);
  }
});
