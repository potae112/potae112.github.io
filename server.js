const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

let rooms = {}; 
// rooms = {
//   1234: { mode: "bo1", players: ["A","B"] }
// }

io.on("connection", socket => {

  socket.on("join-room", ({ room, name, mode }) => {
    socket.join(room);
    socket.room = room;
    socket.name = name;

    if (!rooms[room]) {
      rooms[room] = { mode, players: [] };
    }

    if (!rooms[room].players.includes(name)) {
      rooms[room].players.push(name);
    }

    io.to(room).emit("system", `👋 ${name} เข้าห้องแล้ว`);
    io.emit("rooms-update", rooms);
  });

  socket.on("disconnect", () => {
    const room = socket.room;
    if (!room || !rooms[room]) return;

    rooms[room].players =
      rooms[room].players.filter(p => p !== socket.name);

    if (rooms[room].players.length === 0) {
      delete rooms[room];
    }

    io.emit("rooms-update", rooms);
  });

});

server.listen(3000, () =>
  console.log("🔥 RPS ONLINE running : http://localhost:3000")
);
