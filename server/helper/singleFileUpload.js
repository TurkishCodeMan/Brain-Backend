const Job = require("../models/JobList");
const fs = require("fs");
const multer = require("multer");
const path = require("path");
const User = require("../models/User");
const Guest = require("../models/Guest");

const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const user = await User.findOne({ token: req.query.token });
    cb(null, "uploads/" + user.id || req.query.guestId);
  },
  filename: async (req, file, cb) => {
    const user = await User.findOne({ token: req.query.token });
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);

    if (user.id) {
      await Job.create({
        user_id: user.id,
        fileName: uniqueSuffix + "-" + file.originalname,
        status: "Ready",
      });
    } else {
      await Guest.create({
        guestId: req.query.guestId,
        fileName: uniqueSuffix + "-" + file.originalname,
        status: "Ready",
      });
    }
    if (
      !fs.existsSync(
        path.join(__dirname, "../uploads/" + user.id || req.query.guestId)
      )
    ) {
      fs.mkdirSync(
        path.join(__dirname, "../uploads/" + user.id || req.query.guestId)
      );
    }
    cb(null, file.fieldname + "-" + uniqueSuffix + "-" + file.originalname);
  },
});

const upload = multer({ storage }).single("file");

module.exports = upload;
