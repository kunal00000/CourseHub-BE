"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const index_1 = require("../db/index");
const auth_1 = __importDefault(require("../middleware/auth"));
const router = express_1.default.Router();
dotenv_1.default.config();
const SECRET = process.env.SECRET;
// User routes
router.post("/signup", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, password } = req.body;
    const user = yield index_1.User.findOne({ username });
    if (user) {
        res.status(403).json({ message: "User already exists" });
    }
    else {
        const newUser = new index_1.User({ username, password });
        yield newUser.save();
        const token = jsonwebtoken_1.default.sign({ username, role: "user" }, SECRET, {
            expiresIn: "1h",
        });
        res.json({ message: "User created successfully", token });
    }
}));
router.post("/login", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, password } = req.headers;
    const user = yield index_1.User.findOne({ username, password });
    if (user) {
        const token = jsonwebtoken_1.default.sign({ username, role: "user" }, SECRET, {
            expiresIn: "1d",
        });
        res.json({ message: "Logged in successfully", token });
    }
    else {
        res.status(403).json({ message: "Invalid username or password" });
    }
}));
router.get("/username", auth_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.status(200).json({ message: "Success", username: req.headers["user"] });
}));
router.get("/courses", auth_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const filteredCourses = yield index_1.Course.find({ published: true });
    res.json({ courses: filteredCourses });
}));
router.post("/courses/:courseId", auth_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const course = yield index_1.Course.findById(req.params.courseId);
    if (course) {
        const user = yield index_1.User.findOne({ username: req.headers["user"] });
        if (user) {
            if (user.purchasedCourses.find((purCourse) => String(purCourse._id) == req.params.courseId)) {
                res.status(400).json({ message: "Course is already purchased" });
            }
            else {
                user.purchasedCourses.push(course._id);
                yield user.save();
                res.json({ message: "Course purchased successfully" });
            }
        }
        else {
            res.status(403).json({ message: "User not found" });
        }
    }
    else {
        res.status(404).json({ message: "Course not found" });
    }
}));
router.get("/purchasedCourses", auth_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield index_1.User.findOne({ username: req.headers["user"] }).populate("purchasedCourses");
    if (user) {
        res.json({ purchasedCourses: user.purchasedCourses || [] });
    }
    else {
        res.status(403).json({ message: "User not found" });
    }
}));
exports.default = router;
