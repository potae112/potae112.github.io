const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

let rooms = {};
// rooms[roomId] = {
//   mode: "bo1" | "bo3",
//   players: [{ id, name }],
//   score: { [socketId]: number },
//   round: number,
//   picks: { [socketId]: "rock"|"paper"|"scissors" },
// }

function calcWinner(aPick, bPick) {
  if (aPick === bPick) return 0; // draw
  if (
    (aPick === "rock" && bPick === "scissors") ||
    (aPick === "paper" && bPick === "rock") ||
    (aPick === "scissors" && bPick === "paper")
  ) return 1; // a wins
  return 2; // b wins
}

function neededWins(mode) {
  return mode === "bo3" ? 2 : 1; // bo1:1 win, bo3:2 wins
}

function publicRooms() {
  const out = {};
  for (const r of Object.keys(rooms)) {
    out[r] = {
      mode: rooms[r].mode,
      players: rooms[r].players.map(p => p.name),
      round: rooms[r].round || 1,
    };
  }
  return out;
}

io.on("connection", (socket) => {
  socket.on("join-room", ({ room, name, mode }) => {
    if (!room) return;

    socket.join(room);
    socket.room = room;
    socket.name = name || "Guest";

    if (!rooms[room]) {
      rooms[room] = {
        mode: mode || "bo1",
        players: [],
        score: {},
        round: 1,
        picks: {},
      };
    }

    // ถ้าห้องมี mode อยู่แล้ว ให้ยึดของห้อง (กันคนเข้ามาเปลี่ยน)
    if (rooms[room].mode && mode && rooms[room].players.length > 0) {
      // ignore incoming mode
    } else if (mode) {
      rooms[room].mode = mode;
    }

    // เพิ่มผู้เล่น (จำกัด 2 คนเป็น "ผู้เล่น" ที่เหลือเป็น spectator)
    const already = rooms[room].players.find(p => p.id === socket.id);
    if (!already) {
      if (rooms[room].players.length < 2) {
        rooms[room].players.push({ id: socket.id, name: socket.name });
        rooms[room].score[socket.id] = rooms[room].score[socket.id] || 0;
        io.to(room).emit("system", `🎮 ${socket.name} เข้ามาเป็นผู้เล่น`);
      } else {
        io.to(room).emit("system", `👀 ${socket.name} เข้ามาเป็นผู้ชม`);
      }
    }

    io.to(room).emit("room-state", {
      room,
      mode: rooms[room].mode,
      round: rooms[room].round,
      players: rooms[room].players.map(p => ({ id: p.id, name: p.name })),
      score: rooms[room].score,
      needed: neededWins(rooms[room].mode),
    });

    io.emit("rooms-update", publicRooms());
  });

  socket.on("pick", ({ choice }) => {
    const room = socket.room;
    if (!room || !rooms[room]) return;

    // ต้องเป็น 1 ใน 2 ผู้เล่นเท่านั้นถึง pick ได้
    const players = rooms[room].players;
    const isPlayer = players.some(p => p.id === socket.id);
    if (!isPlayer) return;

    rooms[room].picks[socket.id] = choice;

    io.to(room).emit("system", `✅ ${socket.name} เลือกแล้ว`);

    // ถ้าเลือกครบ 2 คนแล้ว → ตัดสินผล
    if (players.length === 2) {
      const a = players[0];
      const b = players[1];
      const aPick = rooms[room].picks[a.id];
      const bPick = rooms[room].picks[b.id];

      if (!aPick || !bPick) return;

      const w = calcWinner(aPick, bPick);

      let resultText = "🤝 เสมอ!";
      let winnerId = null;

      if (w === 1) {
        winnerId = a.id;
        rooms[room].score[a.id] = (rooms[room].score[a.id] || 0) + 1;
        resultText = `🏆 ${a.name} ชนะรอบนี้!`;
      } else if (w === 2) {
        winnerId = b.id;
        rooms[room].score[b.id] = (rooms[room].score[b.id] || 0) + 1;
        resultText = `🏆 ${b.name} ชนะรอบนี้!`;
      }

      const needed = neededWins(rooms[room].mode);

      // ส่งผลรอบนี้ให้ทุกคนในห้อง
      io.to(room).emit("round-result", {
        a: { name: a.name, pick: aPick, score: rooms[room].score[a.id] || 0 },
        b: { name: b.name, pick: bPick, score: rooms[room].score[b.id] || 0 },
        winnerId,
        text: resultText,
        needed,
        mode: rooms[room].mode,
        round: rooms[room].round,
      });

      // เช็คจบเกม
      const aScore = rooms[room].score[a.id] || 0;
      const bScore = rooms[room].score[b.id] || 0;

      if (aScore >= needed || bScore >= needed) {
        const champ = aScore > bScore ? a : b;
        io.to(room).emit("match-end", {
          winner: champ.name,
          score: { [a.name]: aScore, [b.name]: bScore },
          mode: rooms[room].mode,
        });

        // รีเซ็ตสำหรับเล่นใหม่ในห้องเดิม
        rooms[room].round = 1;
        rooms[room].score[a.id] = 0;
        rooms[room].score[b.id] = 0;
        rooms[room].picks = {};
      } else {
        // ไปตาถัดไป
        rooms[room].round += 1;
        rooms[room].picks = {};
      }

      // อัปเดต state
      io.to(room).emit("room-state", {
        room,
        mode: rooms[room].mode,
        round: rooms[room].round,
        players: rooms[room].players.map(p => ({ id: p.id, name: p.name })),
        score: rooms[room].score,
        needed,
      });
    }
  });

  socket.on("disconnect", () => {
    const room = socket.room;
    if (!room || !rooms[room]) return;

    // ลบจาก players ถ้าเป็นผู้เล่น
    rooms[room].players = rooms[room].players.filter(p => p.id !== socket.id);
    delete rooms[room].score[socket.id];
    delete rooms[room].picks[socket.id];

    io.to(room).emit("system", `👋 ${socket.name || "someone"} ออกห้อง`);

    if (rooms[room].players.length === 0) {
      delete rooms[room];
    } else {
      io.to(room).emit("room-state", {
        room,
        mode: rooms[room].mode,
        round: rooms[room].round,
        players: rooms[room].players.map(p => ({ id: p.id, name: p.name })),
        score: rooms[room].score,
        needed: neededWins(rooms[room].mode),
      });
    }

    io.emit("rooms-update", publicRooms());
  });
});

server.listen(3000, () =>
  console.log("🔥 RPS ONLINE running : http://localhost:3000")
);
