import cors, { CorsOptions } from "cors";
import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";

import adminRoutes from "./routes/admin";
import userRoutes from "./routes/user";

dotenv.config();

const app = express();

const corsOptions: CorsOptions = {
  origin: [
    "http://127.0.0.1:5173",
    "coursehubuser.netlify.app",
    "https://coursehubadmin.netlify.app",
  ],
};

app.use(express.json());
app.use(cors(corsOptions));
app.use("/admin", adminRoutes);
app.use("/users", userRoutes);

// Connect to mongodb
const MONGODB_URI = process.env.dbUri || "";
mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log("connected");
  })
  .catch((err) => {
    console.log(err);
  });

app.listen(3000, () => console.log("Sprinting on port 3000"));
