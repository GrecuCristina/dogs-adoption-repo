const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const PostSchema = new Schema({
  breed: {
    type: ObjectId,
    ref: `Breed`,
  },
  county: {
    type: ObjectId,
    ref: `County`,
  },
  author: {
    type: ObjectId,
    ref: `User`,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  unknownBreed: {
    type: Boolean,
    required: true,
    default: false,
  },
  age: {
    type: Number,
    required: [true, "Vârsta cățelului este obligatorie."],
    min: [0, "Vârsta minimă este 0."],
    max: [25, "Vârsta maximă este 25."],
  },
  petName: {
    type: String,
    required: true,
    minlength: [3, "Numele trebuie să aibă cel puțin 3 caractere."],
    maxlength: [50, "Numele trebuie să aibă cel mult 50 caractere."],
  },

  avatarUrl: {
    type: String,
    default: "",
  },
  description: {
    type: String,
    required: true,
    minlength: [20, "Descrierea trebuie să aibă cel puțin 20 caractere."],
    maxlength: [1000, "Descrierea trebuie să aibă cel mult 1000 caractere."],
  },
  gender: {
    type: String,
    required: [true, "Sexul cățelului este obligatoriu."],
  },
  size: {
    type: String,
    required: false,
    default: "",
  },
  images: {
    type: [
      {
        type: String,
        required: true,
      },
    ],
  },
  isArchived: {
    type: Boolean,
    required: true,
    default: false,
  },
  wasAdopted: {
    type: Boolean,
    required: true,
    default: false,
  },
  isAuthorActive: {
    type: Boolean,
    default: true,
  },
});

const PostModel = mongoose.model("Post", PostSchema);

module.exports = PostModel;
