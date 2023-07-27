import dotenv from "dotenv";
import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

dotenv.config();
const SECRET = process.env.SECRET as string;

interface reqUser {
  username: string;
  role: string;
}

const authenticateJwt = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(" ")[1];
    jwt.verify(token, SECRET, (err, user) => {
      if (err) {
        return res.sendStatus(403);
      }

      const userObj = user as reqUser;
      req.headers["user"] = userObj.username;
      next();
    });
  } else {
    res.sendStatus(401);
  }
};

export default authenticateJwt;
