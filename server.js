require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const app = express();

// 🔥 PORT RAILWAY
const PORT = process.env.PORT || 8080;

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

// ================= ROUTES =================

// ROOT
app.get("/", (req, res) => {
    res.send("SERVER ONLINE 🚀");
});

// REGISTER
app.post("/api/register", async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ message: "Isi semua field" });
        }

        const hashed = await bcrypt.hash(password, 10);

        const user = new User({
            username,
            password: hashed
        });

        await user.save();

        res.json({ message: "Register berhasil" });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// LOGIN
app.post("/api/login", async (req, res) => {
    try {
        const { username, password } = req.body;

        const user = await User.findOne({ username });
        if (!user) return res.status(400).json({ message: "User tidak ada" });

        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.status(400).json({ message: "Password salah" });

        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.ACCESS_SECRET,
            { expiresIn: "1h" }
        );

        res.json({ message: "Login berhasil", token });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ================= START =================
app.listen(PORT, () => {
    console.log("🔥 SERVER RUNNING ON PORT", PORT);
});