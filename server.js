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
const rooms = {};

io.on("connection",socket=>{

  socket.on("join-lobby",name=>{
    socket.emit("room-list",rooms);
  });

  socket.on("join-room",data=>{
    socket.room=data.room;
    socket.name=data.name;

    if(!rooms[data.room]){
      rooms[data.room]={id:data.room,players:0,status:"รอ"}
    }
    rooms[data.room].players++;
    rooms[data.room].status="กำลังเล่น";

    io.emit("room-list",rooms);
  });

  socket.on("disconnect",()=>{
    for(const r in rooms){
      if(rooms[r].players>0){
        rooms[r].players--;
        if(rooms[r].players<=0){
          delete rooms[r];
        }
      }
    }
    io.emit("room-list",rooms);
  });
});
