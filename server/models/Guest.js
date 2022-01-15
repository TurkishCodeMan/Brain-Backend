const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const GuestSchema = new Schema({
  guestId: {
    required: true,
    unique: true,
    type: String,
  },
  image: {
    type: String,
  },
  fileName: {
    required: [true, "Please provide a File Name"],
    type: String,
  },
  status: {
    required: [true, "Please provide a Status"],
    type: String,
    default: "Ready",
    enum: ["Ready", "In Process", "Completed"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Guest", GuestSchema);
