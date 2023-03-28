const bcrypt = require("bcryptjs");
const JWT = require("jsonwebtoken");

const User = require("../models/User.model");

async function register(req, res) {
  const { name, email, password, role } = req.body;
  try {
    const oldUser = await User.findOne({
      email: email,
      isDeleted: false,
    });

    if (oldUser) {
      return res.status(400).send("User Has Already Exist. Please Login");
    }

    const hashedPassword = await bcrypt.hash(password, 12);


    const user = new User({
      name: name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: role,
    });

    await user.save();

    res.status(201).json({
      status: "success",
      message: "User is registered successfully.",
      user,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      status: "error at register to database",
      message: JSON.stringify(err),
    });
  }
}

async function login(req, res) {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({
      email: email,
      isActive: true
    });

    if (!user) {
      return res.status(404).json({
        status: "notFound",
        message: "User not found!",
      });
    }

    if (!bcrypt.compareSync(password, user.password)) {
      return res.status(400).json({
        status: "badRequest",
        message: "Wrong Password!",
      });
    }

    // Create token
    const token = JWT.sign(
      {
        id: user._id.toString(),
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    return res.status(200).json({
      status: "success",
      message: "User is logined successfully",
      data: {
        token,
        user: user,
      },
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      status: "error",
      message: JSON.stringify(err),
    });
  }
}

module.exports = { login, register };