const authenticateJwt = require("../middleware/auth");
const express = require("express");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();
const SECRET = process.env.SECRET;
const router = express.Router();
const { Admin, Course } = require("../db/index");
const { default: mongoose } = require("mongoose");

// Admin routes
router.post("/signup", async (req, res) => {
  const { username, password } = req.body;
  const admin = await Admin.findOne({ username });
  if (admin) {
    res.status(403).json({ message: "Admin already exists" });
  } else {
    const newAdmin = new Admin({
      username,
      password,
      myCourses: [
        new mongoose.Types.ObjectId("64b6f81f6bf4b7cff0ed1978"),
        new mongoose.Types.ObjectId("64b6f8606bf4b7cff0ed197f"),
        new mongoose.Types.ObjectId("64b6f8a86bf4b7cff0ed198f"),
        new mongoose.Types.ObjectId("64b6f8d86bf4b7cff0ed1999"),
        new mongoose.Types.ObjectId("64b6f9056bf4b7cff0ed19a3"),
        new mongoose.Types.ObjectId("64b6f9816bf4b7cff0ed19be"),
        new mongoose.Types.ObjectId("64b6f9a66bf4b7cff0ed19c8"),
        new mongoose.Types.ObjectId("64b6f9c86bf4b7cff0ed19ce")
      ]
    });
    await newAdmin.save();
    const token = jwt.sign({ username, role: "admin" }, SECRET, {
      expiresIn: "1h"
    });
    res.json({ message: "Admin created successfully", token });
  }
});

router.post("/login", async (req, res) => {
  const { username, password } = req.headers;
  const admin = await Admin.findOne({ username, password });
  if (admin) {
    const token = jwt.sign({ username, role: "admin" }, SECRET, {
      expiresIn: "1d"
    });
    res.json({ message: "Logged in successfully", token });
  } else {
    res.status(403).json({ message: "Invalid username or password" });
  }
});

router.get("/username", authenticateJwt, (req, res) => {
  res.status(200).json({ message: "Success", username: req.user.username });
});

router.post("/courses", authenticateJwt, async (req, res) => {
  const admin = await Admin.findOne({ username: req.user.username });
  if (admin) {
    const course = new Course({ ...req.body, updatedAt: new Date() });
    await course.save();
    admin.myCourses.push(course);
    await admin.save();
    res.json({ message: "Course created successfully", courseId: course.id });
  } else {
    res.status(403).json({ message: "Admin not found" });
  }
});

router.put("/courses/:courseId", authenticateJwt, async (req, res) => {
  const course = await Course.findByIdAndUpdate(req.params.courseId, req.body, {
    new: true
  });

  if (course) {
    res.json({ message: "Course updated successfully" });
  } else {
    res.status(404).json({ message: "Course not found" });
  }
});

router.get("/courses", authenticateJwt, async (req, res) => {
  const admin = await Admin.findOne({ username: req.user.username }).populate(
    "myCourses"
  );
  if (admin) {
    res.json({ courses: admin.myCourses });
  } else {
    res.status(403).json({ message: "Admin not found" });
  }
});

module.exports = router;
