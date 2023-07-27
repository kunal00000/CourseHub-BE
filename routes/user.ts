import dotenv from "dotenv";
import express from "express";
import jwt from "jsonwebtoken";

import { Course, User } from "../db/index";
import authenticateJwt from "../middleware/auth";

const router = express.Router();

dotenv.config();

const SECRET = process.env.SECRET as string;

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
  res.status(200).json({ message: "Success", username: req.headers["user"] });
});

router.get("/courses", authenticateJwt, async (req, res) => {
  const filteredCourses = await Course.find({ published: true });
  res.json({ courses: filteredCourses });
});

router.post("/courses/:courseId", authenticateJwt, async (req, res) => {
  const course = await Course.findById(req.params.courseId);
  if (course) {
    const user = await User.findOne({ username: req.headers["user"] });
    if (user) {
      if (
        user.purchasedCourses.find(
          (purCourse) => String(purCourse._id) == req.params.courseId,
        )
      ) {
        res.status(400).json({ message: "Course is already purchased" });
      } else {
        user.purchasedCourses.push(course._id);
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
  const user = await User.findOne({ username: req.headers["user"] }).populate(
    "purchasedCourses",
  );
  if (user) {
    res.json({ purchasedCourses: user.purchasedCourses || [] });
  } else {
    res.status(403).json({ message: "User not found" });
  }
});

export default router;
