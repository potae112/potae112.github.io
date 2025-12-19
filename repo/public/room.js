const socket = io("https://nongtaeplayingsup.onrender.com");

const params = new URLSearchParams(window.location.search);
const room = params.get("room");

document.getElementById("roomId").innerText = room;

socket.emit("joinRoom", { room });

socket.on("roomUpdate", ({ players }) => {
  document.getElementById("players").innerText =
    `ผู้เล่นในห้อง: ${players}/2`;
});

socket.on("countdown", (n) => {
  document.getElementById("status").innerText =
    n > 0 ? `เริ่มใน ${n}` : "เริ่ม!";
});

socket.on("gameStart", () => {
  document.getElementById("status").innerText = "เลือกได้แล้ว";
});

socket.on("result", ({ player, bot }) => {
  document.getElementById("result").innerText =
    `คุณ: ${icon(player)} | บอท: ${icon(bot)}`;
});

function play(choice) {
  socket.emit("play", { room, choice });
}

function startGame() {
  socket.emit("startGame", { room });
}

function icon(v) {
  return v === "rock" ? "✊" : v === "paper" ? "✋" : "✌️";
}
