const bcrypt = require("bcryptjs");
const JWT = require("jsonwebtoken");

const User = require("../models/User.model");

// Function to generate an access token
const generateAccessToken = (user) => {
  return JWT.sign(
    {
      id: user._id.toString(),
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "15m", // Set the expiration time as needed
    }
  );
};

// Function to generate a refresh token
const generateRefreshToken = (user) => {
  return JWT.sign(
    {
      id: user._id.toString(),
      role: user.role,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: "7d", // Set the expiration time as needed
    }
  );
};

async function register(req, res) {
  const { username, email, password } = req.body;
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
      name: username,
      username,
      email: email.toLowerCase(),
      password: hashedPassword,
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

    // Create tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    delete user.password;

    return res.status(200).json({
      accessToken,
      refreshToken,
      user,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      status: "error",
      message: JSON.stringify(err),
    });
  }
}

async function refresh(req, res) {
  const refreshToken = req.body.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({ message: "Refresh token is required!" });
  }

  try {
    const user = JWT.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const accessToken = generateAccessToken(user);
    res.json({ accessToken });
  } catch (error) {
    res.status(403).json({ message: "Invalid refresh token!" });
  }
}

module.exports = { login, register,refresh };
