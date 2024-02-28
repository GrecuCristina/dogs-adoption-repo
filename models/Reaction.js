const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const ReactionSchema = new Schema({
  user: {
    type: ObjectId,
    ref: `User`,
    required: true,
  },
  post: {
    type: ObjectId,
    ref: `Post`,
    required: true,
  },
  // "dislike", "like", "love"
  type: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

const ReactionModel = mongoose.model("Reaction", ReactionSchema);

module.exports = ReactionModel;
