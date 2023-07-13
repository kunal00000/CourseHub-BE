const authenticateJwt = require("../middleware/auth");
const express = require("express");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();
const SECRET = process.env.SECRET;
const router = express.Router();
const { Admin, Course } = require("../db/index");

// Admin routes
router.post("/signup", async (req, res) => {
  const { username, password } = req.body;
  const admin = await Admin.findOne({ username });
  if (admin) {
    res.status(403).json({ message: "Admin already exists" });
  } else {
    const newAdmin = new Admin({ username, password });
    await newAdmin.save();
    const token = jwt.sign({ username, role: "admin" }, SECRET, {
      expiresIn: "1h",
    });
    res.json({ message: "Admin created successfully", token });
  }
});

router.post("/login", async (req, res) => {
  const { username, password } = req.headers;
  const admin = await Admin.findOne({ username, password });
  if (admin) {
    const token = jwt.sign({ username, role: "admin" }, SECRET, {
      expiresIn: "1d",
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
  const course = new Course({ ...req.body, updatedAt: new Date() });
  await course.save();
  res.json({ message: "Course created successfully", courseId: course.id });
});

router.put("/courses/:courseId", authenticateJwt, async (req, res) => {
  const course = await Course.findByIdAndUpdate(req.params.courseId, req.body, {
    new: true,
  });
  console.log(course);
  if (course) {
    res.json({ message: "Course updated successfully" });
  } else {
    res.status(404).json({ message: "Course not found" });
  }
});

router.get("/courses", authenticateJwt, async (req, res) => {
  const courses = await Course.find({});
  res.json({ courses });
});

module.exports = router;
