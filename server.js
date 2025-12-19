const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, "public")));

const rooms = {};

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("joinRoom", ({ room }) => {
    socket.join(room);

    if (!rooms[room]) {
      rooms[room] = {
        players: [],
        ready: false,
        round: 0
      };
    }

    if (rooms[room].players.length < 2) {
      rooms[room].players.push(socket.id);
    }

    io.to(room).emit("roomUpdate", {
      players: rooms[room].players.length
    });
  });

  socket.on("startGame", ({ room }) => {
    rooms[room].round = 3;
    io.to(room).emit("countdown", 3);

    let count = 3;
    const timer = setInterval(() => {
      count--;
      io.to(room).emit("countdown", count);
      if (count === 0) {
        clearInterval(timer);
        io.to(room).emit("gameStart");
      }
    }, 1000);
  });

  socket.on("play", ({ room, choice }) => {
    // บอทโกง 99%
    const loseBot = Math.random() < 0.99;
    const botChoice = loseBot ? winAgainst(choice) : randomChoice();

    io.to(room).emit("result", {
      player: choice,
      bot: botChoice
    });
  });

  socket.on("disconnect", () => {
    for (const room in rooms) {
      rooms[room].players = rooms[room].players.filter(p => p !== socket.id);
      io.to(room).emit("roomUpdate", {
        players: rooms[room].players.length
      });
    }
  });
});

function randomChoice() {
  return ["rock", "paper", "scissors"][Math.floor(Math.random() * 3)];
}

function winAgainst(p) {
  if (p === "rock") return "paper";
  if (p === "paper") return "scissors";
  return "rock";
}

server.listen(3000, () => {
  console.log("Server running on port 3000");
});
