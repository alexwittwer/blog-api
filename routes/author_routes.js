const express = require("express");
const router = express.Router();
const author_controller = require("../controllers/author_controller");

router
  .route("/")
  .get(author_controller.author_get_all)
  .post(author_controller.author_create);
router
  .route("/:authorid")
  .get(author_controller.author_get_single)
  .patch(author_controller.author_patch)
  .delete(author_controller.author_delete);

module.exports = router;
