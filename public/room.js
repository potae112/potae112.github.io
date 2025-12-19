const socket = io();
const params = new URLSearchParams(location.search);
const room = params.get("room");
const name = params.get("name");
const spectator = params.get("spectator") === "1";

document.getElementById("roomId").innerText = `ROOM #${room}`;

socket.emit("joinRoom", { room, name, spectator });

function play(choice){
  if (spectator) return;
  socket.emit("play", choice);
}

socket.on("result", data => {
  const audio =
    data.winner === "draw" ? "draw.mp3" :
    data.winner === socket.id ? "win.mp3" : "lose.mp3";

  new Audio(`/sounds/${audio}`).play();
  document.getElementById("status").innerText = "จบตา!";
});

socket.on("rankUpdate", ranks => {
  document.getElementById("rank").innerHTML =
    Object.entries(ranks).map(r =>
      `<div>${r[0]} : ${r[1]}</div>`
    ).join("");
});

function sendChat(){
  const msg = chatInput.value;
  socket.emit("chat", msg);
  chatInput.value="";
}

socket.on("chat", d => {
  const div = document.createElement("div");
  div.innerHTML = `<b>${d.name}</b> (${d.role}): ${d.msg}`;
  chatBox.appendChild(div);
});
