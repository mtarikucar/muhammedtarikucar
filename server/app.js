const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const http = require("http");
const socketIO = require("socket.io");

require("dotenv").config();

const PORT = process.env.PORT || 5000;

app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

var allowlist = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://18.197.123.238",
  "www.muhammedtarikucar.com",
  "muhammedtarikucar.com",
  "http://muhammedtarikucar.com",
  "http://www.muhammedtarikucar.com",
];
var corsOptionsDelegate = function (req, callback) {
  var corsOptions;
  if (allowlist.indexOf(req.header("Origin")) !== -1) {
    corsOptions = { origin: true };
  } else {
    corsOptions = { origin: false };
  }
  callback(null, corsOptions);
};

app.use(cors(corsOptionsDelegate));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database
mongoose
  .connect(
    process.env.NODE_ENV && process.env.NODE_ENV == "development"
      ? "mongodb://localhost/muhammedtarikucar"
      : process.env.MONGO_URI
  )
  .then(() => console.log("connected to database"))
  .catch((e) => console.log(e));

// Routers
const postRoutes = require("./routers/post");
const authRoutes = require("./routers/auth");
const userRoutes = require("./routers/user");
const communityRoutes = require("./routers/community");

app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/users", userRoutes);
app.use("/api/community", communityRoutes);

server.listen(PORT, () => {
  console.log(
    process.env.NODE_ENV && process.env.NODE_ENV === "development"
      ? `Started: http://localhost:${PORT}`
      : `Started: http://18.197.123.238:${PORT}`
  );
});
