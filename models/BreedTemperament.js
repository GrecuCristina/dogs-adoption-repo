const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const BreedTemperamentSchema = new Schema({
  name: String,
});

const BreedTemperamentModel = mongoose.model(
  "BreedTemperament",
  BreedTemperamentSchema
);

module.exports = BreedTemperamentModel;
