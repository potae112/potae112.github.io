const q = new URLSearchParams(location.search);
const name = q.get("name");
const roomId = q.get("room");

const socket = io();
socket.emit("login", name);
socket.emit("join-room", {room: roomId, name});

room.textContent = "ROOM #" + roomId;

socket.on("players", p=>{
  players.innerHTML = "👤 " + p.join(" vs ");
});

function pick(c){
  socket.emit("choose", c);
}

socket.on("result", r=>{
  if(r.result === "draw"){
    result.textContent = "เสมอ";
  } else {
    result.textContent = `ผู้ชนะ: ${r.result}`;
    document.getElementById(r.result===name?"win":"lose").play();
  }
});

function send(){
  socket.emit("chat", msg.value);
  msg.value="";
}

socket.on("chat", d=>{
  log.innerHTML += `<div>${d.name}: ${d.msg}</div>`;
});
