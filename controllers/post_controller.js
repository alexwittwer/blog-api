const Post = require("../models/post");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");

exports.post_get_all = asyncHandler(async (req, res) => {
  res.json({
    message: "Not implemented yet",
  });
});

exports.post_get_single = asyncHandler(async (req, res) => {
  res.json({
    message: "Not implemented yet",
  });
});

exports.post_create = asyncHandler(async (req, res) => {
  res.json({
    message: "Not implemented yet",
  });
});

exports.post_patch = asyncHandler(async (req, res) => {
  res.json({
    message: "Not implemented yet",
  });
});

exports.post_delete = asyncHandler(async (req, res) => {
  res.json({
    message: "Not implemented yet",
  });
});
