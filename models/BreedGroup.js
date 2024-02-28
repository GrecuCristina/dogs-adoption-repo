const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const BreedGroupSchema = new Schema({
  name: String,
});

const BreedGroupModel = mongoose.model("BreedGroup", BreedGroupSchema);

module.exports = BreedGroupModel;
