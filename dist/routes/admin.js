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
const mongoose_1 = __importDefault(require("mongoose"));
const index_1 = require("../db/index");
const auth_1 = __importDefault(require("../middleware/auth"));
dotenv_1.default.config();
const SECRET = process.env.SECRET;
const router = express_1.default.Router();
// Admin routes
router.post("/signup", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, password } = req.body;
    const admin = yield index_1.Admin.findOne({ username });
    if (admin) {
        res.status(403).json({ message: "Admin already exists" });
    }
    else {
        const newAdmin = new index_1.Admin({
            username,
            password,
            myCourses: [
                new mongoose_1.default.Types.ObjectId("64b6f81f6bf4b7cff0ed1978"),
                new mongoose_1.default.Types.ObjectId("64b6f8606bf4b7cff0ed197f"),
                new mongoose_1.default.Types.ObjectId("64b6f8a86bf4b7cff0ed198f"),
                new mongoose_1.default.Types.ObjectId("64b6f8d86bf4b7cff0ed1999"),
                new mongoose_1.default.Types.ObjectId("64b6f9056bf4b7cff0ed19a3"),
                new mongoose_1.default.Types.ObjectId("64b6f9816bf4b7cff0ed19be"),
                new mongoose_1.default.Types.ObjectId("64b6f9a66bf4b7cff0ed19c8"),
                new mongoose_1.default.Types.ObjectId("64b6f9c86bf4b7cff0ed19ce"),
            ],
        });
        yield newAdmin.save();
        const token = jsonwebtoken_1.default.sign({ username, role: "admin" }, SECRET, {
            expiresIn: "1h",
        });
        res.json({ message: "Admin created successfully", token });
    }
}));
router.post("/login", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, password } = req.headers;
    const admin = yield index_1.Admin.findOne({ username, password });
    if (admin) {
        const token = jsonwebtoken_1.default.sign({ username, role: "admin" }, SECRET, {
            expiresIn: "1d",
        });
        res.json({ message: "Logged in successfully", token });
    }
    else {
        res.status(403).json({ message: "Invalid username or password" });
    }
}));
router.get("/username", auth_1.default, (req, res) => {
    res.status(200).json({ message: "Success", username: req.headers["user"] });
});
router.post("/courses", auth_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const admin = yield index_1.Admin.findOne({ username: req.headers["user"] });
    if (admin) {
        const course = new index_1.Course(Object.assign(Object.assign({}, req.body), { updatedAt: new Date() }));
        yield course.save();
        admin.myCourses.push(course._id);
        yield admin.save();
        res.json({ message: "Course created successfully", courseId: course.id });
    }
    else {
        res.status(403).json({ message: "Admin not found" });
    }
}));
router.put("/courses/:courseId", auth_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const course = yield index_1.Course.findByIdAndUpdate(req.params.courseId, req.body, {
        new: true,
    });
    if (course) {
        res.json({ message: "Course updated successfully" });
    }
    else {
        res.status(404).json({ message: "Course not found" });
    }
}));
router.get("/courses", auth_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const admin = yield index_1.Admin.findOne({ username: req.headers["user"] }).populate("myCourses");
    if (admin) {
        res.json({ courses: admin.myCourses });
    }
    else {
        res.status(403).json({ message: "Admin not found" });
    }
}));
exports.default = router;
