const express = require("express");
const routes = express.Router();
const {
  register,
  login,
  logout,
  getUser,
  uploadZip,
  getZips,
  downloadZip,
  startProcess,
} = require("../controllers/auth");
const authenticate = require("../middleware/verify-token");

routes.get("/", authenticate, getUser);

routes.post("/register", register);

routes.post("/login", login);

routes.post("/logout", authenticate, logout);

routes.post("/uploadZip", authenticate, uploadZip);

routes.get("/getZips", authenticate, getZips);

routes.post("/downloadZip/:file_id", authenticate, downloadZip);

routes.post("/startProcess", authenticate, startProcess);

module.exports = routes;
