const User = require("../models/user");
const Post = require("../models/post");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");

exports.user_get_all = asyncHandler(async (req, res) => {
  const allUsers = await User.find().exec();

  if (allUsers != null) {
    res.json(allUsers);
  } else {
    res.sendStatus(404);
  }
});

exports.user_get_single = asyncHandler(async (req, res) => {
  const user = User.findById(req.params.id);

  if (user) {
    res.json(user);
  } else {
    res.sendStatus(404);
  }
});

exports.user_create = asyncHandler(async (req, res) => {
  const newuser = new User({
    name: req.body.name,
    bio: req.body.bio,
    password: req.body.password,
    email: req.body.email,
  });

  try {
    newuser.save();
    res.json({ message: "User created successfully" });
  } catch (err) {
    res.sendStatus(500);
  }
});

exports.user_patch = asyncHandler(async (req, res) => {
  res.json({
    message: "Not implemented yet",
  });
});

exports.user_delete = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.userid);

  if (!user) {
    res.sendStatus(400);
  } else if (user.posts.length) {
    res.status(403).json({ message: "Delete posts before continuing" });
  } else {
    try {
      await User.findByIdAndDelete(req.params.userid);
      res.status(200).json({ message: "User deleted" });
    } catch (err) {
      res.sendStatus(500);
    }
  }
});