require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const app = express();

// 🔥 PENTING (FIX RAILWAY)
const PORT = process.env.PORT || 3000;

// ================= MIDDLEWARE =================
app.use(cors());
app.use(express.json());

// ================= DEBUG =================
console.log("ENV CHECK:", process.env.MONGO_URI);

// ================= CONNECT MONGO =================
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("🔥 MongoDB connected"))
.catch(err => console.log("❌ Mongo ERROR:", err));

// ================= MODEL =================
const User = mongoose.model("User", new mongoose.Schema({
    username: String,
    password: String,
    role: { type: String, default: "user" },
    refreshToken: String
}));

// ================= TOKEN =================
const generateAccessToken = (user) => {
    return jwt.sign(
        { id: user._id, role: user.role },
        process.env.ACCESS_SECRET,
        { expiresIn: "1h" }
    );
};

// ================= ROUTE TEST =================
app.get("/", (req, res) => {
    res.send("SERVER ONLINE 🚀");
});

// ================= START =================
app.listen(PORT, () => {
    console.log("🔥 SERVER RUNNING ON PORT", PORT);
});