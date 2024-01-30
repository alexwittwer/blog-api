const express = require("express");
const router = express.Router({ mergeParams: true });
const post_controller = require("../controllers/post_controller");

router
  .route("/")
  .get(post_controller.post_get_all)
  .post(post_controller.post_create);
router
  .route("/:postid")
  .get(post_controller.post_get_single)
  .patch(post_controller.post_patch)
  .delete(post_controller.post_delete);

module.exports = router;
