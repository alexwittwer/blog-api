const User = require("../models/user");
const UserAuth = require("../models/user_auth");
const Post = require("../models/post");
const Comment = require("../models/comment");
const passport = require("passport");
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
  try {
    const user = await User.findById(req.params.userid)
      .populate("posts", "comments")
      .exec();

    if (!user) {
      res.sendStatus(404);
    } else {
      res.status(200).json(user);
    }
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

exports.user_create = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Please enter a name")
    .isLength({ min: 6 })
    .withMessage("Name must be a minimum of 6 characters")
    .escape(),
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
      });

      await Promise.all([newuser.save(), newuserAuth.save()]);
      res.json({ message: "User created successfully" });
    } catch (err) {
      res.sendStatus(500);
    }
  }),
];

exports.user_patch = [
  passport.authenticate("jwt", { session: false }),
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Please enter a name")
    .isLength({ min: 6 })
    .withMessage("Name must be a minimum of 6 characters")
    .escape(),
  body("bio").trim().escape(),
  asyncHandler(async (req, res) => {
    try {
      const user = await User.findById(req.params.userid);

      if (user.email !== req.user.email) {
        return res.status(403);
      }

      if (!user) {
        res.status(404).json({ message: "User not found" });
      }

      user.name = req.body.name || user.name;
      user.bio = req.body.bio || user.bio;

      await user.save();
      res.status(200).json(user);
    } catch (err) {
      res.status(500).json(err);
    }
  }),
];

exports.user_delete = [
  passport.authenticate("jwt", { session: false }),
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.userid);

    if (user.email !== req.user.email) {
      return res.status(403);
    }

    if (!user) {
      res.sendStatus(400);
    } else if (user.posts.length) {
      res.status(403).json({ message: "Delete posts before continuing" });
    } else {
      try {
        await Promise.all([
          User.findByIdAndDelete(req.params.userid),
          UserAuth.deleteOne({ email: user.email }),
        ]);
        res.status(200).json({ message: "User deleted" });
      } catch (err) {
        res.sendStatus(500);
      }
    }
  }),
];
