const breeds = require("./breeds.json");

const mongoose = require("mongoose");
const db = require("../models/index");

mongoose.connect("mongodb://localhost/dogsDb");

const breedQualities = new Set();
const breedGroups = new Set();
const breedTemperaments = new Set();

const cleanupName = (name) => {
  if (name.startsWith(", ")) {
    return name.slice(2);
  }
  return name;
};

const sepRegex = /(?=, [A-Z])/;
const splitValues = (values) => {
  if (!values) {
    return [];
  }
  return values.split(sepRegex).map((value) => cleanupName(value));
};

breeds.forEach((breed) => {
  breed.bred_for &&
    splitValues(breed.bred_for).forEach((quality) =>
      breedQualities.add(quality)
    );

  breed.breed_group &&
    splitValues(breed.breed_group).forEach((group) => breedGroups.add(group));

  breed.temperament &&
    splitValues(breed.temperament).forEach((temperament) =>
      breedTemperaments.add(temperament)
    );
});

// console.log(breedQualities);
// console.log(breedGroups);
// console.log(breedTemperaments);

//  INSERT INTO DB

const addBreeds = async () => {
  await db.BreedQuality.collection.drop();
  await Promise.all(
    [...breedQualities].map((quality) => {
      const newQuality = new db.BreedQuality();
      newQuality.name = quality;
      return newQuality.save();
    })
  );

  await db.BreedGroup.collection.drop();
  await Promise.all(
    [...breedGroups].map((group) => {
      const newGroup = new db.BreedGroup();
      newGroup.name = group;
      return newGroup.save();
    })
  );

  await db.BreedTemperament.collection.drop();
  await Promise.all(
    [...breedTemperaments].map((temperament) => {
      const newTemperament = new db.BreedTemperament();
      newTemperament.name = temperament;
      return newTemperament.save();
    })
  );

  await db.Breed.collection.drop();
  for (const breed of breeds) {
    const newBreed = new db.Breed();
    newBreed.name = breed.name;

    const lifeSpan = breed.life_span.replace(" years", "").split(" - ");
    newBreed.lifeSpan = {
      min: lifeSpan[0] && parseInt(lifeSpan[0]),
      max: lifeSpan[1] && parseInt(lifeSpan[1]),
    };

    const weight = breed.weight.metric.split(" - ");
    newBreed.weight = {
      min: weight[0] && parseInt(weight[0]),
      max: weight[1] && parseInt(weight[1]),
    };

    const height = breed.height.metric.split(" - ");
    newBreed.height = {
      min: height[0] && parseInt(height[0]),
      max: height[1] && parseInt(height[1]),
    };

    const breedQs = await db.BreedQuality.find({
      name: { $in: splitValues(breed.bred_for) },
    }).exec();
    newBreed.breedQualities = breedQs.map((quality) => quality._id);

    const breedGs = await db.BreedGroup.find({
      name: breed.breed_group,
    }).exec();
    newBreed.breedGroup = breedGs[0];

    const breedTs = await db.BreedTemperament.find({
      name: { $in: splitValues(breed.temperament) },
    }).exec();
    newBreed.breedTemperaments = breedTs.map((temperament) => temperament._id);

    await newBreed.save();
  }

  process.exit();
};

addBreeds();
