const express = require("express");
const router = express.Router();
const post_controller = require("../controllers/post_controller");

router.get("/", post_controller.post_get_all);
router.get("/:id", post_controller.post_get_single);
router.post("/", post_controller.post_create);
router.patch("/:id", post_controller.post_patch);
router.delete("/:id", post_controller.post_delete);

module.exports = router;
