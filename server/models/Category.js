const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema(
  { id: String, label: String, short: String },
  { _id: false }
);

// Single document holds the entire ordered list
const categoriesSchema = new mongoose.Schema({ list: [itemSchema] }, { timestamps: true });

module.exports = mongoose.model("Categories", categoriesSchema);
