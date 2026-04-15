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

// ================= DB =================
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB connected"))
    .catch(err => console.log(err));

// ================= MODEL =================
const User = require("./models/User");

// ================= ROOT =================
app.get("/", (req, res) => {
    res.send("JWT ADVANCED READY");
});

// ================= REGISTER =================
app.post("/api/register", async (req, res) => {
    const { username, password } = req.body;

    const exist = await User.findOne({ username });
    if (exist) return res.status(400).json({ message: "Username dipakai" });

    const hashed = await bcrypt.hash(password, 10);

    const user = new User({ username, password: hashed });
    await user.save();

    res.json({ message: "Register sukses" });
});

// ================= LOGIN (ACCESS + REFRESH TOKEN) =================
app.post("/api/login", async (req, res) => {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ message: "User tidak ditemukan" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: "Password salah" });

    // 🔵 ACCESS TOKEN (cepat expired)
    const accessToken = jwt.sign(
        { id: user._id, username: user.username },
        process.env.ACCESS_SECRET || "accesssecret",
        { expiresIn: "15m" }
    );

    // 🟢 REFRESH TOKEN (lama expired)
    const refreshToken = jwt.sign(
        { id: user._id },
        process.env.REFRESH_SECRET || "refreshsecret",
        { expiresIn: "7d" }
    );

    // simpan refresh token di cookie
    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: false
    });

    res.json({
        message: "Login sukses",
        accessToken
    });
});

// ================= REFRESH TOKEN =================
app.post("/api/refresh", (req, res) => {
    const token = req.cookies.refreshToken;

    if (!token) return res.status(401).json({ message: "No refresh token" });

    try {
        const decoded = jwt.verify(token, process.env.REFRESH_SECRET || "refreshsecret");

        const newAccessToken = jwt.sign(
            { id: decoded.id },
            process.env.ACCESS_SECRET || "accesssecret",
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

// ================= AUTH MIDDLEWARE =================
function auth(req, res, next) {
    const header = req.headers.authorization;

    if (!header) return res.status(401).json({ message: "No token" });

    const token = header.split(" ")[1];

    try {
        const decoded = jwt.verify(token, process.env.ACCESS_SECRET || "accesssecret");
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ message: "Token invalid / expired" });
    }
}

// ================= PROFILE =================
app.get("/api/profile", auth, (req, res) => {
    res.json({
        message: "Profile akses sukses",
        user: req.user
    });
});

// ================= START =================
app.listen(PORT, () => {
    console.log(`SERVER RUN http://localhost:${PORT}`);
});