const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const ConversationSchema = new Schema({
  user: {
    type: ObjectId,
    ref: `User`,
    required: true,
  },
  postAuthor: {
    type: ObjectId,
    ref: `User`,
    required: true,
  },
  post: {
    type: ObjectId,
    ref: `Post`,
    required: true,
  },
  lastUpdate: {
    type: Date,
    default: 0,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

const ConversationModel = mongoose.model("Conversation", ConversationSchema);

module.exports = ConversationModel;
