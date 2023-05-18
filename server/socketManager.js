const users = {};

const socketManager = (io) => {
  io.on("connection", (socket) => {
    /* console.log("New user connected"); */

    socket.on("join", ({ username, room }) => {
      users[socket.id] = { username, room };
      socket.join(room);

      socket.emit("message", {
        user: "admin",
        text: `${username}, welcome to the room ${room}`,
      });

      socket.broadcast
        .to(room)
        .emit("message", { user: "admin", text: `${username} has joined!` });
    });

    socket.on("sendMessage", (message, callback) => {
      const user = users[socket.id];
      io.to(user.room).emit("message", { user: user.username, text: message });

      callback();
    });

    socket.on("disconnect", () => {
      const user = users[socket.id];
      if (user) {
        io.to(user.room).emit("message", {
          user: "admin",
          text: `${user.username} has left the room.`,
        });
        delete users[socket.id];
      }
    });
  });
};

module.exports = socketManager;