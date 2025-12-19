const q = new URLSearchParams(location.search);
const roomId = q.get("room");
const name = q.get("name");

document.getElementById("roomTitle").innerText = `ROOM #${roomId}`;

const socket = io();

socket.emit("join-room", { roomId, name });

function pick(c) {
  socket.emit("choose", c);
}

socket.on("result", r => {
  document.getElementById("result").innerText =
    `${r.p1.name} ${r.p1.choice} | ${r.p2.name} ${r.p2.choice}`;

  new Audio(
    r.p1.result === "win" || r.p2.result === "win"
    ? "sounds/win.mp3"
    : "sounds/lose.mp3"
  ).play();
});

socket.on("room-update", room => {
  document.getElementById("spectators").innerHTML =
    room.spectators.map(s => `<li>${s.name}</li>`).join("");

  document.getElementById("history").innerHTML =
    room.history.map(h =>
      `<li>${h.p1.name} vs ${h.p2.name}</li>`
    ).join("");
});

function send() {
  const txt = document.getElementById("chatInput").value;
  socket.emit("chat", `${name}: ${txt}`);
  document.getElementById("chatInput").value = "";
}

socket.on("chat", m => {
  document.getElementById("chatBox").innerHTML += `<div>${m}</div>`;
});
