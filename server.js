const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

const rooms = {};

io.on("connection", socket => {

  socket.on("join", ({ room, name, spectator }) => {
    socket.join(room);

    if (!rooms[room]) {
      rooms[room] = {
        players: {},
        spectators: [],
        leaderboard: {}
      };
    }

    if (spectator) {
      rooms[room].spectators.push(name);
    } else {
      rooms[room].players[socket.id] = { name, choice: null };
      rooms[room].leaderboard[name] = rooms[room].leaderboard[name] || 1000;
    }

    io.to(room).emit("update", rooms[room]);
  });

  socket.on("play", ({ room, choice }) => {
    if (!rooms[room]) return;
    rooms[room].players[socket.id].choice = choice;

    const players = Object.values(rooms[room].players);
    if (players.length === 2 && players.every(p => p.choice)) {
      const [a, b] = players;

      let result = "draw";
      if (
        (a.choice==="rock"&&b.choice==="scissors")||
        (a.choice==="paper"&&b.choice==="rock")||
        (a.choice==="scissors"&&b.choice==="paper")
      ) result = a.name;
      else if (a.choice !== b.choice) result = b.name;

      if (result !== "draw") {
        rooms[room].leaderboard[result] += 10;
      }

      io.to(room).emit("result", {
        a, b, result,
        leaderboard: rooms[room].leaderboard
      });

      players.forEach(p => p.choice = null);
    }
  });

  socket.on("chat", ({ room, name, msg }) => {
    io.to(room).emit("chat", { name, msg });
  });

  socket.on("disconnect", () => {
    for (const room in rooms) {
      delete rooms[room].players[socket.id];
      io.to(room).emit("update", rooms[room]);
    }
  });

});

server.listen(process.env.PORT || 3000, () =>
  console.log("RPS ONLINE RUNNING")
);
