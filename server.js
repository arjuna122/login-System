const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
require("dotenv").config();

const app = express();
const PORT = 3000;

// ================= MIDDLEWARE =================
app.use(cors({
    origin: true,
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// DEBUG
app.use((req, res, next) => {
    console.log("HIT:", req.method, req.url);
    next();
});

// ================= CONNECT DB =================
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB connected"))
    .catch(err => console.log("MongoDB error:", err));

// ================= MODEL =================
const User = require("./models/User");

// ================= ROOT =================
app.get("/", (req, res) => {
    res.send("SERVER FINAL READY 🔥");
});

// ================= REGISTER =================
app.post("/api/register", async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ message: "Username & password wajib diisi" });
        }

        const exist = await User.findOne({ username });
        if (exist) {
            return res.status(400).json({ message: "Username sudah dipakai" });
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

// ================= LOGIN =================
app.post("/api/login", async (req, res) => {
    try {
        const { username, password } = req.body;

        const user = await User.findOne({ username });
        if (!user) return res.status(400).json({ message: "User tidak ditemukan" });

        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.status(400).json({ message: "Password salah" });

        // ACCESS TOKEN
        const accessToken = jwt.sign(
            {
                id: user._id,
                username: user.username,
                role: user.role
            },
            process.env.ACCESS_SECRET,
            { expiresIn: "15m" }
        );

        // REFRESH TOKEN
        const refreshToken = jwt.sign(
            { id: user._id },
            process.env.REFRESH_SECRET,
            { expiresIn: "7d" }
        );

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true
        });

        res.json({
            message: "Login berhasil",
            accessToken
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ================= REFRESH =================
app.post("/api/refresh", (req, res) => {
    const token = req.cookies.refreshToken;

    if (!token) return res.status(401).json({ message: "No refresh token" });

    try {
        const decoded = jwt.verify(token, process.env.REFRESH_SECRET);

        const newAccessToken = jwt.sign(
            { id: decoded.id },
            process.env.ACCESS_SECRET,
            { expiresIn: "15m" }
        );

        res.json({ accessToken: newAccessToken });

    } catch (err) {
        res.status(401).json({ message: "Refresh token invalid" });
    }
});

// ================= LOGOUT =================
app.post("/api/logout", (req, res) => {
    res.clearCookie("refreshToken");
    res.json({ message: "Logout berhasil" });
});

// ================= AUTH =================
function auth(req, res, next) {
    const header = req.headers.authorization;

    if (!header) return res.status(401).json({ message: "No token" });

    const token = header.split(" ")[1];

    try {
        const decoded = jwt.verify(token, process.env.ACCESS_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ message: "Token invalid / expired" });
    }
}

// ================= ADMIN CHECK =================
function isAdmin(req, res, next) {
    if (req.user.role !== "admin") {
        return res.status(403).json({ message: "Bukan admin" });
    }
    next();
}

// ================= PROFILE =================
app.get("/api/profile", auth, (req, res) => {
    res.json({
        message: "Profile berhasil",
        user: req.user
    });
});

// ================= ADMIN ROUTE =================
app.get("/api/admin", auth, isAdmin, (req, res) => {
    res.json({
        message: "Selamat datang admin 🔥"
    });
});

// ================= MAKE ADMIN =================
app.post("/api/make-admin", async (req, res) => {
    const { username } = req.body;

    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ message: "User tidak ada" });

    user.role = "admin";
    await user.save();

    res.json({ message: "Sekarang admin 🔥" });
});

// ================= LIHAT SEMUA USER =================
app.get("/api/users", async (req, res) => {
    const users = await User.find();
    res.json(users);
});

// ================= START =================
app.listen(PORT, () => {
    console.log(`🔥 SERVER JALAN DI http://localhost:${PORT}`);
});