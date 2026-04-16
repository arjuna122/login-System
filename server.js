require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");

const app = express();
const PORT = 3000;

// ================= DEBUG ENV =================
console.log("ENV CHECK:", process.env.MONGO_URI);

// ================= MIDDLEWARE =================
app.use(cors());
app.use(express.json());
app.use(cookieParser());

// ================= CONNECT MONGODB =================
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => {
    console.log("🔥 MongoDB connected");
})
.catch(err => {
    console.log("❌ MongoDB FULL ERROR:");
    console.log(err);
});

// ================= MODEL =================
const userSchema = new mongoose.Schema({
    username: String,
    password: String,
    role: {
        type: String,
        default: "user"
    },
    refreshToken: String
});

const User = mongoose.model("User", userSchema);

// ================= HELPER =================
const generateAccessToken = (user) => {
    return jwt.sign(
        { id: user._id, username: user.username, role: user.role },
        process.env.ACCESS_SECRET,
        { expiresIn: "1h" }
    );
};

const generateRefreshToken = (user) => {
    return jwt.sign(
        { id: user._id },
        process.env.REFRESH_SECRET,
        { expiresIn: "1d" }
    );
};

// ================= MIDDLEWARE AUTH =================
const verifyToken = (req, res, next) => {
    const authHeader = req.headers["authorization"];

    if (!authHeader) {
        return res.status(401).json({ message: "No token" });
    }

    const token = authHeader.split(" ")[1];

    jwt.verify(token, process.env.ACCESS_SECRET, (err, user) => {
        if (err) return res.status(403).json({ message: "Token invalid" });

        req.user = user;
        next();
    });
};

const isAdmin = (req, res, next) => {
    if (req.user.role !== "admin") {
        return res.status(403).json({ message: "Bukan admin" });
    }
    next();
};

// ================= ROUTES =================

// ROOT
app.get("/", (req, res) => {
    res.send("SERVER JALAN 🔥");
});

// REGISTER
app.post("/api/register", async (req, res) => {
    try {
        const { username, password } = req.body;

        const exist = await User.findOne({ username });
        if (exist) return res.status(400).json({ message: "User sudah ada" });

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

        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);

        user.refreshToken = refreshToken;
        await user.save();

        res.json({
            message: "Login berhasil",
            accessToken,
            refreshToken
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PROFILE
app.get("/api/profile", verifyToken, (req, res) => {
    res.json({
        message: "Profile berhasil",
        user: req.user
    });
});

// MAKE ADMIN
app.post("/api/make-admin", async (req, res) => {
    const { username } = req.body;

    const user = await User.findOne({ username });
    if (!user) return res.json({ message: "User tidak ada" });

    user.role = "admin";
    await user.save();

    res.json({ message: "User jadi admin" });
});

// ADMIN ROUTE
app.get("/api/admin", verifyToken, isAdmin, (req, res) => {
    res.json({ message: "Selamat datang admin 🔥" });
});

// REFRESH TOKEN
app.post("/api/refresh", async (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) return res.status(401).json({ message: "No refresh token" });

    const user = await User.findOne({ refreshToken });
    if (!user) return res.status(403).json({ message: "Invalid refresh token" });

    jwt.verify(refreshToken, process.env.REFRESH_SECRET, (err) => {
        if (err) return res.status(403).json({ message: "Token expired" });

        const newAccessToken = generateAccessToken(user);

        res.json({ accessToken: newAccessToken });
    });
});

// LOGOUT
app.post("/api/logout", async (req, res) => {
    const { refreshToken } = req.body;

    const user = await User.findOne({ refreshToken });
    if (user) {
        user.refreshToken = null;
        await user.save();
    }

    res.json({ message: "Logout berhasil" });
});

// ================= START =================
app.listen(PORT, () => {
    console.log(`🔥 SERVER JALAN DI http://localhost:${PORT}`);
});