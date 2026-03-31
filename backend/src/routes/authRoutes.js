const express = require("express");
const { registerUser, loginUser, getProfile, deleteAccount } = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/profile", authMiddleware, getProfile);
router.delete("/account", authMiddleware, deleteAccount);

module.exports = router;