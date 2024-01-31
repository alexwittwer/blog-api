const express = require("express");
const router = express.Router({ mergeParams: true });
const auth_controller = require("../controllers/auth_controller");

router.route("/login").post(auth_controller.login);

module.exports = router;
