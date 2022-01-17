const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const path = require("path");
const fs = require("fs");
const User = require("../models/User");
const Job = require("../models/JobList");
const Guest = require("../models/Guest");
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

      return res.status(201).json(data);
    } else {
      return res
        .status(400)
        .json({ status: false, message: "User already registered" });
    }
  } catch (e) {
    return res.status(201).json(e);
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
      return res.json({ status: false, message: "Wrong password" });
    }
  } else {
    return res.json({ status: false, message: "Can't find user" });
  }
};

const logout = (req, res) => {
  res.status(401).json({ status: false, message: "Logout" });
};

const getUser = async (req, res) => {
  try {
    if (req.query.guestId) {
      var guest = await Guest.findOne({ guest: req.query.guestId });
    } else {
      var user = await User.findOne({ token: req.query.token });
      var folders = await Job.find({ user_id: user.id }).sort({
        createdAt: -1,
      });
    }

    if (folders[0].fileName || guest.fileName) {
      try {
        diretoryTreeToObj(
          path.join(
            __dirname,
            "../uploads/" + user.id || req.query.guestId + "/"
          ), //nii.giz
          (err, data) => {
            if (err) console.error(err);
            res.status(200).json({
              user: user || req.query.guestId,
              directories: data || [],
              folders: folders || [],
            });
          }
        );
      } catch (err) {
        res.status(400).json(err);
      }
    }
    res.status(200).json({
      user: user || req.query.guestId,
      directories: data || [],
      folders: folders || [],
    });
  } catch (err) {
    res.status(204).json(err);
  }
};

const uploadZip = (req, res) => {
  singleFileUpload(req, res, async (error) => {
    if (error) {
      res.json(error).status(400);
    } else {
      res.json({ status: true, message: "Upload Success" }).status(201);
    }
  });
};

const downloadZip = async (req, res) => {
  try {
    const folderPath = path.join(
      __dirname + "../../uploads/file-" + req.params.file_id + ".nii.gz"
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
  const { spawn } = require("child_process");
  var dataToSend;
  var dataTo;
  //Job için fileName de alınması lazım
  if (req.query.token) {
    await Job.findOneAndUpdate(
      {
        user_id: user.id,
        fileName: req.query.fileName,
      },
      {
        status: "In Process",
      },
      {
        new: true,
      }
    );

    const python = spawn("python", [
      __dirname + "/mri_read_and_convert.py",
      path.join(__dirname, "../uploads/" + user.id + "/" + req.query.fileName),
    ]);
    python.stdout.on("data", (data) => {
      console.log("Pipe data from python script ...");
      dataTo = String(data).replace(/(\r\n|\n|\r)/gm, "");
    });

    python.stderr.on("data", (data) => {
      console.error(`stderr: ${data}`);
    });

    python.on("close", async (code) => {
      console.log(`child process close all stdio with code ${code}`);
      await Job.findOneAndUpdate(
        { user_id: user.id },
        {
          status: "Completed",
        },
        {
          new: true,
        }
      );
      const pyt = spawn("python", [__dirname + "/filtering.py", dataTo]);
      pyt.stdout.on("data", (data) => {
        console.log("Pipe data from python script ...");
        dataToSend = String(data).replace(/(\r\n|\n|\r)/gm, "");
      });

      pyt.stderr.on("data", (data) => {
        console.error(`stderr: ${data}`);
      });
      pyt.on("close", async (code) => {
        console.log(`child process close all stdio with code ${code}`);
        await Job.findOneAndUpdate(
          { user_id: user.id },
          {
            status: "Completed",
          },
          {
            new: true,
          }
        );
        res.sendFile(dataToSend);
      });
    });
  } else {
    await Guest.findOneAndUpdate(
      {
        guestId: req.query.guestId,
        fileName: req.query.fileName,
      },
      {
        status: "In Process",
      },
      {
        new: true,
      }
    );
    const python = spawn("python", [
      __dirname + "/mri_read_and_convert.py",
      path.join(
        __dirname,
        "../uploads/" + req.query.guestId + "/" + req.query.fileName
      ),
    ]);
    python.stdout.on("data", (data) => {
      console.log("Pipe data from python script ...");
      dataTo = String(data).replace(/(\r\n|\n|\r)/gm, "");
    });

    python.stderr.on("data", (data) => {
      console.error(`stderr: ${data}`);
    });
    python.on("close", async (code) => {
      console.log(`child process close all stdio with code ${code}`);
      await Guest.findOneAndUpdate(
        { guestId: req.query.guestId },
        {
          status: "Completed",
        },
        {
          new: true,
        }
      );
      const pyt = spawn("python", [__dirname + "/filtering.py", dataTo]);
      pyt.stdout.on("data", (data) => {
        console.log("Pipe data from python script ...");
        dataToSend = String(data).replace(/(\r\n|\n|\r)/gm, "");
      });

      pyt.stderr.on("data", (data) => {
        console.error(`stderr: ${data}`);
      });
      pyt.on("close", async (code) => {
        console.log(`child process close all stdio with code ${code}`);
        await Guest.findOneAndUpdate(
          { guestId: req.query.guestId },
          {
            status: "Completed",
          },
          {
            new: true,
          }
        );
        res.sendFile(dataToSend);
      });
    });
  }
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
  downloadZip,
  startProcess,
};
