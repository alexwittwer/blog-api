const express = require("express");
const router = express.Router();
const author_controller = require("../controllers/author_controller");

router.get("/", author_controller.author_get_all);
router.get("/:id", author_controller.author_get_single);
router.post("/", author_controller.author_create);
router.patch("/:id", author_controller.author_patch);
router.delete("/:id", author_controller.author_delete);

module.exports = router;
