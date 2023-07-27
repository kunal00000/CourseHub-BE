"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const admin_1 = __importDefault(require("./routes/admin"));
const user_1 = __importDefault(require("./routes/user"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const corsOptions = {
    origin: [
        "http://127.0.0.1:5173",
        "coursehubuser.netlify.app",
        "https://coursehubadmin.netlify.app",
    ],
};
app.use(express_1.default.json());
app.use((0, cors_1.default)(corsOptions));
app.use("/admin", admin_1.default);
app.use("/users", user_1.default);
// Connect to mongodb
const MONGODB_URI = process.env.dbUri || "";
mongoose_1.default
    .connect(MONGODB_URI)
    .then(() => {
    console.log("connected");
})
    .catch((err) => {
    console.log(err);
});
app.listen(3000, () => console.log("Sprinting on port 3000"));
