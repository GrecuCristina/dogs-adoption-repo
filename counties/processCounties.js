const mongoose = require("mongoose");
const db = require("../models/index");

mongoose.connect("mongodb://localhost/dogsDb");

const counties = new Array(
  "Bucuresti",
  "Alba",
  "Arad",
  "Arges",
  "Bacau",
  "Bihor",
  "Bistrita - Nasaud",
  "Botosani",
  "Braila",
  "Brasov",
  "Buzau",
  "Calarasi",
  "Caras - Severin",
  "Cluj",
  "Constanta",
  "Covasna",
  "Dambovita",
  "Dolj",
  "Galati",
  "Giurgiu",
  "Gorj",
  "Harghita",
  "Hunedoara",
  "Ialomita",
  "Iasi",
  "Ilfov",
  "Maramures",
  "Mehedinti",
  "Mures",
  "Neamt",
  "Olt",
  "Prahova",
  "Salaj",
  "Satu Mare",
  "Sibiu",
  "Suceava",
  "Teleorman",
  "Timis",
  "Tulcea",
  "Valcea",
  "Vaslui",
  "Vrancea"
);

const addCounties = async () => {
  await db.County.collection.drop();
  await Promise.all(
    [...counties].map((county) => {
      const newCounty = new db.County();
      newCounty.name = county;
      return newCounty.save();
    })
  );
  process.exit();
};

addCounties();
