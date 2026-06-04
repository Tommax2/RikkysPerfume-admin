const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name:     { type: String, required: true },
  sub:      { type: String, default: "" },
  family:   { type: String, default: "" },
  notes:    { type: String, default: "" },
  price:    { type: Number, required: true },
  badge:    { type: String, default: "" },
  color:    { type: String, default: "#FAF8FC" },
  accent:   { type: String, default: "#6A0DAD" },
  category: { type: String, required: true },
  image:    { type: String, default: "" },
  featured: { type: Boolean, default: false },
  order:    { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model("Product", productSchema);
