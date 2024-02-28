const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const MessageSchema = new Schema({
  author: {
    type: ObjectId,
    ref: `User`,
    required: true,
  },
  conversation: {
    type: ObjectId,
    ref: `Conversation`,
    required: true,
  },
  content: {
    type: String,
    required: true,
    minlength: [1, "Mesajul trebuie să aibă cel puțin un caracter."],
    maxlength: [150, "Mesajul trebuie să aibă cel mult 150 caractere."],
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

const MessageModel = mongoose.model("Message", MessageSchema);

module.exports = MessageModel;
