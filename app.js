require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const postRouter = require("./routes/post_routes");
const logger = require("morgan");
const userRouter = require("./routes/user_routes");
const commentRouter = require("./routes/comment_routes");
const authRouter = require("./routes/auth_routes");
const cors = require("cors");

const mongoDB = process.env.MONGODB_URI;
mongoose.connect(mongoDB);
const db = mongoose.connection;
db.on("error", console.error.bind(console, "Error connecting to MongoDB"));
db.once("connect", () => console.log("Connected to MongoDB"));

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(logger("dev"));
app.use(cors());

app.use("/posts", postRouter);
app.use("/users", userRouter);
app.use("/posts/:postid/comments", commentRouter);
app.use("/auth", authRouter);

app.listen(process.env.PORT || 3000, () => {
  console.log("Server is listening...");
});
