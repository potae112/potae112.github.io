const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

/* ====== เก็บข้อมูลห้อง ====== */
const rooms = {}; 
// rooms[roomId] = { users: Set(), spectators: Set() }

io.on("connection", socket => {
  console.log("User connected:", socket.id);

  socket.on("join-room", ({ room, name, spectator }) => {
    socket.join(room);

    if (!rooms[room]) {
      rooms[room] = { users: new Set(), spectators: new Set() };
    }

    if (spectator) {
      rooms[room].spectators.add(name);
    } else {
      rooms[room].users.add(name);
    }

    socket.room = room;
    socket.name = name;

    io.to(room).emit("system-message", {
      text: `${name} เข้าห้อง`,
    });

    io.to(room).emit("spectator-list", {
      spectators: [...rooms[room].spectators]
    });
  });

  /* ====== CHAT REALTIME ====== */
  socket.on("chat", msg => {
    if (!socket.room) return;

    io.to(socket.room).emit("chat", {
      name: socket.name,
      msg,
      time: new Date().toLocaleTimeString()
    });
  });

  socket.on("disconnect", () => {
    if (!socket.room) return;

    const room = rooms[socket.room];
    if (!room) return;

    room.users.delete(socket.name);
    room.spectators.delete(socket.name);

    io.to(socket.room).emit("system-message", {
      text: `${socket.name} ออกห้อง`
    });

    io.to(socket.room).emit("spectator-list", {
      spectators: [...room.spectators]
    });
  });
});

server.listen(process.env.PORT || 3000, () =>
  console.log("Server running")
);
