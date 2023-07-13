const express = require("express");
const router = express.Router();
const authenticateJwt = require("../middleware/auth");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();
const { User, Course } = require("../db/index");
const SECRET = process.env.SECRET;

// User routes
router.post("/signup", async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (user) {
    res.status(403).json({ message: "User already exists" });
  } else {
    const newUser = new User({ username, password });
    await newUser.save();
    const token = jwt.sign({ username, role: "user" }, SECRET, {
      expiresIn: "1h",
    });
    res.json({ message: "User created successfully", token });
  }
});

router.post("/login", async (req, res) => {
  const { username, password } = req.headers;
  const user = await User.findOne({ username, password });
  if (user) {
    const token = jwt.sign({ username, role: "user" }, SECRET, {
      expiresIn: "1d",
    });
    res.json({ message: "Logged in successfully", token });
  } else {
    res.status(403).json({ message: "Invalid username or password" });
  }
});

router.get("/username", authenticateJwt, async (req, res) => {
  res.status(200).json({ message: "Success", username: req.user.username });
});

router.get("/courses", authenticateJwt, async (req, res) => {
  const filteredCourses = await Course.find({ published: true });
  res.json({ courses: filteredCourses });
});

router.post("/courses/:courseId", authenticateJwt, async (req, res) => {
  const course = await Course.findById(req.params.courseId);
  if (course) {
    const user = await User.findOne({ username: req.user.username });
    if (user) {
      if (
        user.purchasedCourses.find(
          (purCourse) => purCourse._id == req.params.courseId
        )
      ) {
        res.status(400).json({ message: "Course is already purchased" });
      } else {
        user.purchasedCourses.push(course);
        await user.save();
        res.json({ message: "Course purchased successfully" });
      }
    } else {
      res.status(403).json({ message: "User not found" });
    }
  } else {
    res.status(404).json({ message: "Course not found" });
  }
});

router.get("/purchasedCourses", authenticateJwt, async (req, res) => {
  const user = await User.findOne({ username: req.user.username }).populate(
    "purchasedCourses"
  );
  if (user) {
    res.json({ purchasedCourses: user.purchasedCourses || [] });
  } else {
    res.status(403).json({ message: "User not found" });
  }
});

module.exports = router;
