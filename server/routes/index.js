const express = require("express");

const routes = express.Router();

const { register, login, logout, uploadZip } = require("../controllers/auth");

routes.get("/", function (req, res) {
  res.send("Hello");
});

routes.post("/register", register);

routes.post("/login", login);

routes.post("/logout", logout);

routes.post("/uploadZip", uploadZip);

module.exports = routes;
