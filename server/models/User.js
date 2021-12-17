const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const UserSchema = new Schema({
  first_name: { required: [true, "Please provide a firstname"], type: String },
  last_name: { required: [true, "Please provide a lastname"], type: String },
  email: {
    required: [true, "Please provide a valid email"],
    type: String,
    unique: true,
    match: [
      /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/,
      "Please provide a valid name",
    ],
  },
  token: {
    type: String,
  },
  password: {
    type: String,
    minlength: [6, "Please provide a password with min 6 lenght"],
    required: [true, "Please provide a password"],
    select: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("User", UserSchema);
