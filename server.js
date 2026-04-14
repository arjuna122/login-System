const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcrypt");
require("dotenv").config();

const app = express();

// middleware
app.use(cors());
app.use(express.json());

// connect MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB local connected"))
    .catch(err => console.log("MongoDB error:", err));

// import model
const User = require("./models/User");

// test route
app.get("/", (req, res) => {
    res.send("Server Hidup + Connect MongoDB");
});

// ================= REGISTER =================
app.post("/api/register", async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ message: "Username & password wajib diisi" });
        }

        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: "Username sudah dipakai" });
        }

        // HASH PASSWORD
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new User({
            username,
            password: hashedPassword
        });

        await user.save();

        res.json({ message: "User berhasil dibuat" });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ================= LOGIN =================
app.post("/api/login", async (req, res) => {
    try {
        const { username, password } = req.body;

        const user = await User.findOne({ username });

        if (!user) {
            return res.status(400).json({ message: "User tidak ditemukan" });
        }

        // COMPARE PASSWORD
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ message: "Password salah" });
        }

        res.json({ message: "Login berhasil" });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// start server
app.listen(3000, () => {
    console.log("Server berjalan di http://localhost:3000");
});