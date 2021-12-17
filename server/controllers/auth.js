const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const path = require("path");
const fs = require("fs");
const User = require("../models/User");
const Job = require("../models/JobList");
const singleFileUpload = require("../helper/singleFileUpload");

const register = async (req, res) => {
  const { email, password, first_name, last_name } = req.body;
  try {
    const user = await User.findOne({
      email,
    });

    if (!user) {
      const hash = await bcrypt.hash(password, 10);
      const data = await User.create({
        email,
        password: hash,
        first_name,
        last_name,
      });

      res.status(201).json(data);
    } else {
      res
        .status(400)
        .json({ status: false, message: "User already registered" });
    }
  } catch (e) {
    res.status(201).json(e);
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({
    email,
  }).select("password");

  if (user) {
    const result = await bcrypt.compare(password, user.password);
    if (result) {
      const payload = {
        email,
      };
      const token = await jwt.sign(payload, process.env.JWT_SECRET_KEY, {
        expiresIn: 720,
      });
      await User.updateOne({ email: email }, { token: token });
      res.json({ status: true, token: token });
    } else {
      res.json({ status: false, message: "Wrong password" });
    }
  } else {
    res.json({ status: false, message: "Can't find user" });
  }
};

const logout = (req, res) => {
  res.status(401).json({ status: false, message: "Logout" });
};

const getUser = async (req, res) => {
  const user = await User.findOne({ token: req.query.token });
  const folders = await Job.findOne({ user_id: user.id });
  res.status(200).json({ user: user, folders: folders });
};

const uploadZip = (req, res) => {
  singleFileUpload(req, res, async (error) => {
    if (error) {
      res.json(error).status(400);
    } else {
      try {
        res.json([data]).status(201);
      } catch (error) {
        res.json(error).status(400);
      }
    }
  });
};

const getZips = async (req, res) => {
  const data = await Job.find({ user: req.query.id }).exec();
  res.send(data);
};

const downloadZip = async (req, res) => {
  try {
    const folderPath = path.join(
      __dirname + "../../server/../uploads/file-" + req.params.file_id + ".rar"
    );
    const file = fs.createReadStream(folderPath);
    res.setHeader("Content-Disposition", 'attachment: filename="' + file + '"');
    file.pipe(res);
  } catch (err) {
    console.log(err);
  }
};

module.exports = {
  register,
  login,
  logout,
  getUser,
  uploadZip,
  getZips,
  downloadZip,
};
