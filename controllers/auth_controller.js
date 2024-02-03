const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const UserAuth = require("../models/user_auth");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const passport = require("passport");
const jwtStrategy = require("../config/jwt");
passport.use(jwtStrategy);

exports.login = asyncHandler(async (req, res) => {
  let { email, password } = req.body;

  try {
    const user = await UserAuth.findOne({ email });
    const match = await bcrypt.compare(password, user.password);

    if (!user) return res.status(404).send();
    if (!match) return res.status(401).send();

    const opts = {};
    const key = process.env.JWT_KEY;
    const token = jwt.sign({ email, user }, key, opts);

    return res.status(200).json({
      message: "Authorization passed",
      token,
      user,
    });
  } catch (err) {
    return res.sendStatus(500);
  }
});
