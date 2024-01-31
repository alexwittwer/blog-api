const express = require("express");
const router = express.Router();
const user_controller = require("../controllers/user_controller");

router
  .route("/")
  .get(user_controller.user_get_all)
  .post(user_controller.user_create);
router
  .route("/:userid")
  .get(user_controller.user_get_single)
  .patch(user_controller.user_patch)
  .delete(user_controller.user_delete);

module.exports = router;
