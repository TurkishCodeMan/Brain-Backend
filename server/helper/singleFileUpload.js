const Job = require("../models/JobList");
const multer = require("multer");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: async (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    await Job.create({
      user_id: req.query.id,
      fileName: uniqueSuffix + "-" + file.originalname,
      status: "Ready",
    });
    cb(null, file.fieldname + "-" + uniqueSuffix + "-" + file.originalname);
  },
});

const upload = multer({ storage }).single("file");

module.exports = upload;
