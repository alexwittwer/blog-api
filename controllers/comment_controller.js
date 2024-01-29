const Author = require("../models/author");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");

exports.comment_get_all = asyncHandler(async (req, res) => {
  res.json({
    message: "Not implemented yet",
  });
});

exports.comment_get_single = asyncHandler(async (req, res) => {
  res.json({
    message: "Not implemented yet",
  });
});

exports.comment_create = asyncHandler(async (req, res) => {
  res.json({
    message: "Not implemented yet",
  });
});

exports.comment_patch = asyncHandler(async (req, res) => {
  res.json({
    message: "Not implemented yet",
  });
});

exports.comment_delete = asyncHandler(async (req, res) => {
  res.json({
    message: "Not implemented yet",
  });
});
