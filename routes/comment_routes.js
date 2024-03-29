const express = require("express");
const router = express.Router({ mergeParams: true });
const comment_controller = require("../controllers/comment_controller");

router
  .route("/")
  .get(comment_controller.comment_get_all)
  .post(comment_controller.comment_create);
router
  .route("/:commentid")
  .get(comment_controller.comment_get_single)
  .patch(comment_controller.comment_patch)
  .delete(comment_controller.comment_delete);

module.exports = router;
