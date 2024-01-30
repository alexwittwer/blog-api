const Author = require("../models/author");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");

exports.author_get_all = asyncHandler(async (req, res) => {
  const allAuthors = await Author.find().exec();

  if (allAuthors != null) {
    res.json(allAuthors);
  } else {
    res.sendStatus(404);
  }
});

exports.author_get_single = asyncHandler(async (req, res) => {
  const author = Author.findById(req.params.id);

  if (author) {
    res.json(author);
  } else {
    res.sendStatus(404);
  }
});

exports.author_create = asyncHandler(async (req, res) => {
  const newAuthor = new Author({
    name: req.body.name,
    bio: req.body.bio,
  });

  try {
    newAuthor.save();
    res.json(newAuthor);
  } catch (err) {
    res.sendStatus(500);
  }
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
