const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const BreedSchema = new Schema({
  name: String,
  breedQualities: [
    {
      type: ObjectId,
      ref: `BreedQuality`,
    },
  ],
  breedGroup: {
    type: ObjectId,
    ref: `BreedGroup`,
  },
  breedTemperaments: [
    {
      type: ObjectId,
      ref: `BreedTemperament`,
    },
  ],
  lifeSpan: {
    min: Number,
    max: Number,
  },
  weight: {
    min: Number,
    max: Number,
  },
  height: {
    min: Number,
    max: Number,
  },
});

const BreedModel = mongoose.model("Breed", BreedSchema);

module.exports = BreedModel;
