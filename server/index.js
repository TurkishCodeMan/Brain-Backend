const express = require("express");
const routes = require("./routes/index");
const connectDatabase = require("./database/connectDatabase");
const path = require("path");
require("dotenv").config();

connectDatabase();

const app = express();

app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/", routes);

app.listen(process.env.PORT, () => {
  console.log("Server Started");
});
