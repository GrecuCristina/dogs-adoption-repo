const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const BreedQualitySchema = new Schema({
  name: String,
});

const BreedQualityModel = mongoose.model("BreedQuality", BreedQualitySchema);

module.exports = BreedQualityModel;
