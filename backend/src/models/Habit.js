const mongoose = require("mongoose");

const habitSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    lastCompletedDate: {
      type: Date,
      default: null,
    },
    streak: {
      type: Number,
      default: 0,
    },
  },
  {
    versionKey: false,
  }
);

module.exports = mongoose.model("Habit", habitSchema);

