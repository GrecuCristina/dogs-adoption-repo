const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const CountySchema = new Schema({
  name: {
    type: String,
    required: true,
  },
});

const CountyModel = mongoose.model("County", CountySchema);

module.exports = CountyModel;
