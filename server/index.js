const express = require("express");
const routes = require("./routes/index");
const connectDatabase = require("./database/connectDatabase");
const path = require("path");
const cors = require("cors");
require("dotenv").config();

connectDatabase();

const app = express();

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/", routes);

app.listen(process.env.PORT, () => {
  console.log("Server Started");
});
