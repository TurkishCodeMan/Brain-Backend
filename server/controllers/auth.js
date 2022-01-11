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
        expiresIn: 720 * 60,
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
  diretoryTreeToObj("C:/Users/ebube/Desktop/a", async function (err, data) {
    if (err) console.error(err);

    const user = await User.findOne({ token: req.query.token });
    const folders = await Job.findOne({ user_id: user.id });
    res.status(200).json({ user: user, directories: data, folders: folders });
  });
};

const uploadZip = (req, res) => {
  singleFileUpload(req, res, async (error) => {
    if (error) {
      res.json(error).status(400);
    } else {
      try {
        res.json({ status: true, message: "Upload Success" }).status(201);
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

const startProcess = async (req, res) => {
  const user = await User.findOne({ token: req.query.token });

  const folder = await Job.findOneAndUpdate(
    { fileName: req.query.fileName },
    {
      status: "In Process",
    },
    {
      new: true,
    }
  );
  const { spawn } = require("child_process");
  var dataToSend;
  const python = spawn("python", [
    __dirname + "/mri_read_and_convert.py",
    folder.fileName,
    path.join(__dirname, "../uploads/" + user.id),
  ]);

  python.stdout.on("data", (data) => {
    console.log("Pipe data from python script ...");
    dataToSend = String(data);
  });

  python.stderr.on("data", (data) => {
    console.error(`stderr: ${data}`);
  });

  python.on("close", (code) => {
    console.log(`child process close all stdio with code ${code}`);
    await Job.findOneAndUpdate(
      { fileName: req.query.fileName },
      {
        status: "Completed",
      },
      {
        new: true,
      }
    );
    res.send({
      status: "Completed",
      PSNR: dataToSend,
    });
  });
};

var diretoryTreeToObj = function (dir, done) {
  var results = [];

  fs.readdir(dir, function (err, list) {
    if (err) return done(err);

    var pending = list.length;

    if (!pending)
      return done(null, {
        label: path.basename(dir),
        id: Math.round(Math.random(1000) + 12),
        nodes: results,
      });

    list.forEach(function (file) {
      file = path.resolve(dir, file);
      fs.stat(file, function (err, stat) {
        if (stat && stat.isDirectory()) {
          diretoryTreeToObj(file, function (err, res) {
            results.push({
              label: path.basename(file),
              id: Math.round(Math.random(1000) + 12),
              nodes: res,
            });
            if (!--pending) done(null, results);
          });
        } else {
          results.push({
            id: Math.round(Math.random(1000) + 12),
            label: path.basename(file),
          });
          if (!--pending) done(null, results);
        }
      });
    });
  });
};

module.exports = {
  register,
  login,
  logout,
  getUser,
  uploadZip,
  getZips,
  downloadZip,
  startProcess,
};
