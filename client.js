const socket = io();
const q = new URLSearchParams(location.search);
const room = q.get("room");
const name = q.get("name");
const spectator = q.get("spec") === "true";

document.getElementById("room").innerText = "ROOM #" + room;

socket.emit("join", { room, name, spectator });

function play(c) {
  socket.emit("play", { room, choice: c });
}

function send() {
  socket.emit("chat", { room, name, msg: msg.value });
  msg.value = "";
}

socket.on("update", data => {
  spec.innerHTML = data.spectators.map(s => `<li>${s}</li>`).join("");
});

socket.on("result", r => {
  board.innerHTML = Object.entries(r.leaderboard)
    .map(([n,s])=>`<li>${n}: ${s}</li>`).join("");

  if (r.result === name) win.play();
  else if (r.result !== "draw") lose.play();
});

socket.on("chat", m => {
  chat.innerHTML += `<div><b>${m.name}:</b> ${m.msg}</div>`;
});
