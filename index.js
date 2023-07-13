const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const adminRoutes = require("./routes/admin");
const userRoutes = require("./routes/user");
const dotenv = require("dotenv");
dotenv.config();

const app = express();

app.use(express.json());
app.use(
  cors([
    { origin: "http://127.0.0.1:5173" },
    { origin: "https://main--coursehubadmin.netlify.app" },
    { origin: "https://coursehubadmin.netlify.app" },
    { origin: "coursehubuser.netlify.app" },
  ])
);
app.use("/admin", adminRoutes);
app.use("/users", userRoutes);

// Connect to mongodb
dbUri = process.env.dbUri;
mongoose
  .connect(dbUri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("connected");
  })
  .catch((err) => {
    console.log(err);
  });

app.listen(3000, () => console.log("Sprinting on port 3000"));
