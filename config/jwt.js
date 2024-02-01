require("dotenv").config();

const User = require("../models/user");
const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = process.env.JWT_KEY;

module.exports = new JwtStrategy(opts, async (jwt_payload, done) => {
  try {
    const user = await User.findOne({ email: jwt_payload.email });

    if (!user) {
      return done(null, false);
    }

    return done(null, jwt_payload);
  } catch (err) {
    return done(err, false);
  }
});
