const express = require("express");
const router = express.Router();
const Categories = require("../models/Category");
const verifyToken = require("../middleware/auth");

const DEFAULT_CATEGORIES = [
  { id: "all",      label: "All",           short: "All"      },
  { id: "perfume",  label: "Perfume",        short: "Perfume"  },
  { id: "spray",    label: "Body Spray",     short: "Spray"    },
  { id: "roll-on",  label: "Roll On",        short: "Roll On"  },
  { id: "oil",      label: "Perfume Oil",    short: "Oil"      },
  { id: "diffuser", label: "Reed Diffuser",  short: "Diffuser" },
  { id: "gift-set", label: "Gift Set",       short: "Gift"     },
];

// GET /api/categories — public, used by the store website
router.get("/", async (req, res) => {
  try {
    const doc = await Categories.findOne().lean();
    res.json(doc ? doc.list : DEFAULT_CATEGORIES);
  } catch {
    res.status(500).json({ error: "Failed to fetch categories" });
  }
});

// PUT /api/categories — admin only (JWT required)
router.put("/", verifyToken, async (req, res) => {
  const { categories } = req.body || {};
  if (!Array.isArray(categories) || categories.length === 0) {
    return res.status(400).json({ error: "categories must be a non-empty array" });
  }
  try {
    const doc = await Categories.findOneAndUpdate(
      {},
      { list: categories },
      { upsert: true, new: true, lean: true }
    );
    res.json(doc.list);
  } catch {
    res.status(500).json({ error: "Failed to save categories" });
  }
});

module.exports = router;
