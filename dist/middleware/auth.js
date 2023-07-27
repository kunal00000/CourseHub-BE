"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
dotenv_1.default.config();
const SECRET = process.env.SECRET;
const authenticateJwt = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader) {
        const token = authHeader.split(" ")[1];
        jsonwebtoken_1.default.verify(token, SECRET, (err, user) => {
            if (err) {
                return res.sendStatus(403);
            }
            const userObj = user;
            req.headers["user"] = userObj.username;
            next();
        });
    }
    else {
        res.sendStatus(401);
    }
};
exports.default = authenticateJwt;
