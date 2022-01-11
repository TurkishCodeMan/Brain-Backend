const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const JobSchema = new Schema({
  user_id: {
    required: [true, "User not found"],
    type: Schema.Types.ObjectId,
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

module.exports = mongoose.model("Job", JobSchema);
