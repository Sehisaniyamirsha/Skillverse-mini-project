require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const path = require("path");
const connectDB = require("./config/db");
const { notFound, errorHandler } = require("./middleware/errorHandler");

// Route imports
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const skillRoutes = require("./routes/skillRoutes");
const learningRoutes = require("./routes/learningRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const activityRoutes = require("./routes/activityRoutes");
const certificateRoutes = require("./routes/certificateRoutes");
const creditRoutes = require("./routes/creditRoutes");
const leaderboardRoutes = require("./routes/leaderboardRoutes");
const badgeRoutes = require("./routes/badgeRoutes");
const rewardRoutes = require("./routes/rewardRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const adminRoutes = require("./routes/adminRoutes");

const app = express();

// Connect to MongoDB
connectDB();

// Core middleware
app.use(cors({ origin: process.env.CLIENT_URL || "*", credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

// Serve uploaded files (certificates, proofs, profile photos)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Serve the plain HTML/CSS/JS frontend from the same Express app.
// This removes the need for Live Server in local/deployed setups.
app.use(express.static(__dirname, {
  index: false,
  extensions: ["html"],
}));

// Public homepage
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});
app.get("/api/health", (req, res) => {
  res.json({ success: true, status: "ok", time: new Date().toISOString() });
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/skills", skillRoutes);
app.use("/api/learning", learningRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/activities", activityRoutes);
app.use("/api/certificates", certificateRoutes);
app.use("/api/credits", creditRoutes);
app.use("/api/leaderboard", leaderboardRoutes);
app.use("/api/badges", badgeRoutes);
app.use("/api/rewards", rewardRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/admin", adminRoutes);

// 404 + error handling
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`SkillVerse backend running on port ${PORT}`);
});

module.exports = app;
