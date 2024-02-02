const User = require("../models/user");
const UserAuth = require("../models/user_auth");
const Post = require("../models/post");
const Comment = require("../models/comment");
const passport = require("passport");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");

exports.user_get_all = asyncHandler(async (req, res) => {
  try {
    const allUsers = await User.find().exec();

    if (allUsers != null) {
      return res.json(allUsers);
    }

    return res.sendStatus(404);
  } catch (err) {
    console.error(err);
    return res.sendStatus(500);
  }
});

exports.user_get_single = asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.params.userid)
      .populate({
        path: "comments",
        select: "text parent",
      })
      .populate({
        path: "posts",
        select: "title",
      })
      .exec();

    if (!user) {
      return res.sendStatus(404);
    }

    return res.status(200).json(user);
  } catch (err) {
    console.error(err);
    return res.sendStatus(500);
  }
});

exports.user_create = [
  body("name").trim().notEmpty().withMessage("Please enter a name").escape(),
  body("bio").trim().escape(),
  body("email")
    .escape()
    .notEmpty()
    .isEmail()
    .withMessage("Please enter a valid email"),
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: "Could not post due to validation errors",
        err: errors,
      });
    }

    try {
      const check = await User.findOne({ email: req.body.email }).exec();

      if (check != null) {
        return res.status(400).json({ message: "Error: email already in use" });
      }

      const newuser = new User({
        name: req.body.name,
        bio: req.body.bio,
        email: req.body.email,
      });

      const newuserAuth = new UserAuth({
        password: req.body.password,
        email: req.body.email,
        userid: newuser.id,
      });

      await Promise.all([newuser.save(), newuserAuth.save()]);
      return res.json({ message: "User created successfully" });
    } catch (err) {
      return res.sendStatus(500);
    }
  }),
];

exports.user_patch = [
  passport.authenticate("jwt", { session: false }),
  body("name").trim().notEmpty().withMessage("Please enter a name").escape(),
  body("bio").trim().escape(),
  asyncHandler(async (req, res) => {
    try {
      const user = await User.findById(req.params.userid);

      // protects comments from other user deleting or updating them
      if (user.email !== req.user.email) {
        return res.sendStatus(403);
      }

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      user.name = req.body.name || user.name;
      user.bio = req.body.bio || user.bio;

      await user.save();
      return res.status(200).json(user);
    } catch (err) {
      return res.status(500).json(err);
    }
  }),
];

exports.user_delete = [
  passport.authenticate("jwt", { session: false }),
  asyncHandler(async (req, res) => {
    try {
      const user = await User.findById(req.params.userid);

      if (!user) {
        return res.sendStatus(400);
      }

      // protects comments from other user deleting or updating them
      if (user.email !== req.user.email) {
        return res.sendStatus(403);
      }

      if (user.posts.length) {
        return res
          .status(403)
          .json({ message: "Delete posts before continuing" });
      }

      await Promise.all([
        User.findByIdAndDelete(req.params.userid),
        UserAuth.deleteOne({ email: user.email }),
      ]);
      return res.status(200).json({ message: "User deleted" });
    } catch (err) {
      return res.sendStatus(500);
    }
  }),
];
