require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const app = express();

// ================= CONFIG =================
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

// ================= CONNECT MONGODB =================
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log("MongoDB Error:", err));

// ================= USER MODEL =================
const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    default: "user", // user / admin
  },
});

const User = mongoose.model("User", UserSchema);

// ================= AUTH MIDDLEWARE =================
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ message: "Invalid token" });
  }
};

// ================= ADMIN MIDDLEWARE =================
const verifyAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin only access" });
  }
  next();
};

// ================= REGISTER =================
app.post("/api/register", async (req, res) => {
  try {
    const { username, password } = req.body;

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: "User sudah ada" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      username,
      password: hashedPassword,
    });

    await user.save();

    res.json({ message: "Register berhasil" });
  } catch (err) {
    res.status(500).json({ message: err.message });
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

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Password salah" });
    }

    const token = jwt.sign(
      {
        id: user._id,
        username: user.username,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({ token });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ================= PROFILE (USER LOGIN) =================
app.get("/api/profile", verifyToken, (req, res) => {
  res.json({
    message: "Profile berhasil diakses",
    user: req.user,
  });
});

// ================= ADMIN ROUTE =================
app.get("/api/admin/users", verifyToken, verifyAdmin, async (req, res) => {
  const users = await User.find().select("-password");
  res.json(users);
});

// ================= HOME =================
app.get("/", (req, res) => {
  res.send("API jalan 🚀");
});

// ================= START SERVER =================
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});