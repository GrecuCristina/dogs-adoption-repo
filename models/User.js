const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const UserSchema = new Schema({
  name: {
    type: String,
    required: true,
    minlength: [3, "Numele trebuie să aibă cel puțin 3 caractere."],
  },
  password: {
    type: String,
    required: true,
    select: false,
  },
  email: {
    type: String,
    required: true,
    unique: [true, "msg"],
    validate: {
      validator: (value) =>
        value.length &&
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(value),
      message: (props) => `${props.value} nu este o adresă de e-mail validă.`,
    },
  },
  profileImage: {
    type: String,
    default: "",
  },

  role: {
    type: ObjectId,
    required: true,
    ref: `Role`,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
});

const UserModel = mongoose.model("User", UserSchema);

module.exports = UserModel;
