const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
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

const uploadZip = (req, res) => {
  try {
    singleFileUpload(req, res, function (error) {
      if (error) {
        res.json(error).status(400);
      } else {
        res.json(req.file).status(200);
      }
    });
  } catch (error) {
    console.log("error", error);
  }
};

module.exports = { register, login, logout, uploadZip };
