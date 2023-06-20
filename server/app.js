const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const http = require("http");
const socketIO = require("socket.io");
const Messages = require("./models/Message.model")

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
const messageRoutes = require("./routers/message");
const roomRoutes = require("./routers/room");

app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/users", userRoutes);
app.use("/api/community", communityRoutes);
app.use("/api/message", messageRoutes);
app.use("/api/room", roomRoutes);

server.listen(PORT, () => {
  console.log(
    process.env.NODE_ENV && process.env.NODE_ENV === "development"
      ? `Started: http://localhost:${PORT}`
      : `Started: http://18.197.123.238:${PORT}`
  );
});

global.onlineUsers = new Map();

// Socket connection event
io.on("connection", (socket) => {
  global.chatSocket = socket;
console.log("a user connecte");
  socket.on("room", (data) => {
    socket.join(data._id);
    console.log("A user connected to room ",data._id);
  });


  socket.on("add-user", (data) => {
    onlineUsers.set(data.currentUser._id, { id: socket.id, room: data.room._id });
    socket.to(data.room).emit(
      "onlineUsers",
      [...onlineUsers.values()].filter((user) => user.room === data.room)
    );
    console.log(onlineUsers);
  });

  // Socket event for sending messages
  socket.on("sendMessage", async (messageData) => {
    // Broadcast the received message to all connected sockets in the specified room
    socket.to(messageData.roomID).emit("receiveMessage", messageData);
    
    await Messages.create({
      message:messageData.message,
      room:messageData.roomID,
      sender: messageData.sender,
    });
    console.log(messageData);
  });



  // Socket event for leaving a room
  socket.on("leaveRoom", (roomID) => {
    socket.leave(roomID);
    let disconnectedUser;
    onlineUsers.forEach((user, key) => {
      if (user.id === socket.id) {
        disconnectedUser = user;
        onlineUsers.delete(key);
        return;
      }
    });

    if (disconnectedUser) {
      socket.to(disconnectedUser.room).emit(
        "onlineUsers",
        [...onlineUsers.values()].filter(
          (user) => user.room === disconnectedUser.room
        )
      );
    }
    console.log(onlineUsers);
  });

  // Socket disconnection event
  socket.on("disconnect", () => {
    
    console.log(onlineUsers);
  });
});
