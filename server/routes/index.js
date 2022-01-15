const express = require("express");
const routes = express.Router();
const {
  register,
  login,
  logout,
  getUser,
  uploadZip,
  downloadZip,
  startProcess,
} = require("../controllers/auth");
const authenticate = require("../middleware/verify-token");

routes.get("/", getUser);

routes.post("/register", register);

routes.post("/login", login);

routes.post("/logout", authenticate, logout);

routes.post("/uploadZip", uploadZip);

routes.post("/downloadZip/:file_id", authenticate, downloadZip);

routes.post("/startProcess", startProcess);

module.exports = routes;
