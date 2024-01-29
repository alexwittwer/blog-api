const Post = require("../models/post");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");

exports.author_get_all = asyncHandler(async (req, res) => {
  res.json({
    message: "Not implemented yet",
  });
});

exports.author_get_single = asyncHandler(async (req, res) => {
  res.json({
    message: "Not implemented yet",
  });
});

exports.author_create = asyncHandler(async (req, res) => {
  res.json({
    message: "Not implemented yet",
  });
});

exports.author_patch = asyncHandler(async (req, res) => {
  res.json({
    message: "Not implemented yet",
  });
});

exports.author_delete = asyncHandler(async (req, res) => {
  res.json({
    message: "Not implemented yet",
  });
});
