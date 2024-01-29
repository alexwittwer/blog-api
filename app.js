require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const postRouter = require("./routes/post_routes");
const authorRouter = require("./routes/author_routes");
const commentRouter = require("./routes/comment_routes");

const mongoDB = process.env.MONGODB_URI;
mongoose.connect(mongoDB);
const db = mongoose.connection;
db.on("error", console.error.bind(console, "Error connecting to MongoDB"));
db.once("connect", () => console.log("Connected to MongoDB"));

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/posts", postRouter);
app.use("/authors", authorRouter);
app.use("/comments", commentRouter);

app.listen(process.env.PORT || 3000, () => {
  console.log("Server is listening...");
});
