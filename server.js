const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

const rooms = {};

function result(a,b){
  if(a===b) return 0;
  if(
    (a==="rock"&&b==="scissors")||
    (a==="paper"&&b==="rock")||
    (a==="scissors"&&b==="paper")
  ) return 1;
  return -1;
}

io.on("connection", socket => {

  socket.on("join-room", ({room,name,mode})=>{
    socket.join(room);
    socket.room = room;
    socket.name = name;

    if(!rooms[room]){
      rooms[room] = {
        mode,
        players:{},
        choices:{},
        score:{}
      };
    }

    rooms[room].players[socket.id] = name;
    rooms[room].score[socket.id] ??= 0;

    io.to(room).emit("players", Object.values(rooms[room].players));
  });

  socket.on("play", move=>{
    const room = rooms[socket.room];
    if(!room) return;

    room.choices[socket.id] = move;

    const ids = Object.keys(room.players);
    if(ids.length < 2) return;

    const [a,b] = ids;
    if(!room.choices[a] || !room.choices[b]) return;

    const r = result(room.choices[a], room.choices[b]);
    let winner = "draw";

    if(r===1){ room.score[a]++; winner = room.players[a]; }
    if(r===-1){ room.score[b]++; winner = room.players[b]; }

    io.to(socket.room).emit("round-result",{
      a:{name:room.players[a],move:room.choices[a],score:room.score[a]},
      b:{name:room.players[b],move:room.choices[b],score:room.score[b]},
      winner
    });

    room.choices = {};
  });

  socket.on("chat", msg=>{
    io.to(socket.room).emit("chat",{
      name:socket.name,
      msg
    });
  });

  socket.on("disconnect",()=>{
    const room = rooms[socket.room];
    if(!room) return;

    delete room.players[socket.id];
    delete room.score[socket.id];

    if(Object.keys(room.players).length===0){
      delete rooms[socket.room];
    }
  });

});

server.listen(process.env.PORT||3000,()=>{
  console.log("RPS ONLINE RUNNING");
});
