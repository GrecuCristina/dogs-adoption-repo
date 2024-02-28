const mongoose = require("mongoose");
const db = require("../models/index");

mongoose.connect("mongodb://localhost/dogsDb");
const updateUsers = async () => {
  await db.User.updateMany({}, { $set: { isActive: true } });
  process.exit();
};

// updateUsers();

const updatePosts = async () => {
  await db.Post.updateMany({}, { $set: { isAuthorActive: true } });
  process.exit();
};

// updatePosts();
