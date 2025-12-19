const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);

app.use(express.static("public"));

let rooms = {};
let ranks = {};

io.on("connection", socket => {

  socket.on("login", name => {
    socket.name = name;
    if (!ranks[name]) ranks[name] = 1000;
    socket.emit("rank", ranks[name]);
    socket.emit("rooms", Object.values(rooms));
  });

  socket.on("create-room", mode => {
    const id = Math.floor(1000 + Math.random() * 9000);
    rooms[id] = {
      id,
      mode,
      players: [],
      choices: {}
    };
    io.emit("rooms", Object.values(rooms));
  });

  socket.on("join-room", ({ room, name }) => {
    socket.room = room;
    socket.join(room);
    if (!rooms[room].players.includes(name)) {
      rooms[room].players.push(name);
    }
    io.to(room).emit("players", rooms[room].players);
    io.emit("rooms", Object.values(rooms));
  });

  socket.on("choose", choice => {
    const room = rooms[socket.room];
    room.choices[socket.name] = choice;

    if (Object.keys(room.choices).length === room.players.length) {
      const [a, b] = room.players;
      const ca = room.choices[a];
      const cb = room.choices[b];

      let result = "draw";
      if (
        (ca === "rock" && cb === "scissors") ||
        (ca === "paper" && cb === "rock") ||
        (ca === "scissors" && cb === "paper")
      ) result = a;
      else if (ca !== cb) result = b;

      if (result !== "draw") {
        ranks[result] += 20;
        ranks[result === a ? b : a] -= 10;
      }

      io.to(socket.room).emit("result", {
        a, ca, b, cb, result
      });

      room.choices = {};
    }
  });

  socket.on("chat", msg => {
    io.to(socket.room).emit("chat", {
      name: socket.name,
      msg
    });
  });

  socket.on("disconnect", () => {
    if (!socket.room) return;
    const room = rooms[socket.room];
    if (!room) return;
    room.players = room.players.filter(p => p !== socket.name);
    if (room.players.length === 0) delete rooms[socket.room];
    io.emit("rooms", Object.values(rooms));
  });

});

http.listen(process.env.PORT || 3000);
