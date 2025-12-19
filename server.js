const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));
app.use("/sounds", express.static("sounds"));

const rooms = {};

io.on("connection", socket => {

  socket.on("joinRoom", ({ room, name, spectator }) => {
    socket.join(room);
    socket.room = room;
    socket.name = name;
    socket.role = spectator ? "spectator" : "player";

    if (!rooms[room]) {
      rooms[room] = {
        players: [],
        choices: {},
        ranks: {}
      };
    }

    if (!spectator && rooms[room].players.length < 2) {
      rooms[room].players.push(socket.id);
      rooms[room].ranks[name] ??= 1000;
    }

    io.to(room).emit("playersUpdate", {
      players: rooms[room].players.length
    });

    io.to(room).emit("rankUpdate", rooms[room].ranks);
  });

  socket.on("play", choice => {
    const room = socket.room;
    if (!room) return;

    rooms[room].choices[socket.id] = choice;

    if (Object.keys(rooms[room].choices).length === 2) {
      const ids = Object.keys(rooms[room].choices);
      const c1 = rooms[room].choices[ids[0]];
      const c2 = rooms[room].choices[ids[1]];

      let result = "draw";
      if (
        (c1 === "rock" && c2 === "scissors") ||
        (c1 === "paper" && c2 === "rock") ||
        (c1 === "scissors" && c2 === "paper")
      ) result = ids[0];
      else if (c1 !== c2) result = ids[1];

      const resData = {
        choices: rooms[room].choices,
        winner: result
      };

      if (result !== "draw") {
        const winSocket = io.sockets.sockets.get(result);
        if (winSocket) {
          rooms[room].ranks[winSocket.name] += 10;
        }
      }

      io.to(room).emit("result", resData);
      io.to(room).emit("rankUpdate", rooms[room].ranks);
      rooms[room].choices = {};
    }
  });

  socket.on("chat", data => {
    io.to(socket.room).emit("chat", {
      name: socket.name,
      role: socket.role,
      msg: data,
      time: new Date().toLocaleTimeString()
    });
  });

  socket.on("disconnect", () => {
    const room = socket.room;
    if (!room || !rooms[room]) return;

    rooms[room].players = rooms[room].players.filter(id => id !== socket.id);
    delete rooms[room].choices[socket.id];

    io.to(room).emit("playersUpdate", {
      players: rooms[room].players.length
    });
  });
});

server.listen(process.env.PORT || 3000, () =>
  console.log("Server running")
);
