const Job = require("../models/JobList");
const fs = require("fs");
const multer = require("multer");
const path = require("path");
const User = require("../models/User");

const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const user = await User.findOne({ token: req.query.token });
    cb(null, "uploads/" + user.id);
  },
  filename: async (req, file, cb) => {
    const user = await User.findOne({ token: req.query.token });
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    if (!fs.existsSync(path.join(__dirname, "../uploads/" + user.id))) {
      fs.mkdirSync(path.join(__dirname, "../uploads/" + user.id));
    }

    if (user.id) {
      await Job.create({
        user_id: user.id,
        fileName: uniqueSuffix + "-" + file.originalname,
        status: "Ready",
      });
    }
    cb(null, file.fieldname + "-" + uniqueSuffix + "-" + file.originalname);
  },
});

const upload = multer({ storage }).single("file");

module.exports = upload;
