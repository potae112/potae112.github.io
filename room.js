const socket = io();
const q = new URLSearchParams(location.search);
const room = q.get("room");
const name = q.get("name") || "Guest";
const mode = q.get("mode");

document.getElementById("title").innerText = `ROOM #${room}`;

socket.emit("join-room", { room, name, mode });

socket.on("system", msg=>{
  const div = document.createElement("div");
  div.innerText = msg;
  document.getElementById("log").appendChild(div);
});

document.getElementById("copy").onclick = ()=>{
  navigator.clipboard.writeText(room);
  alert("คัดลอกเลขห้องแล้ว");
};

function pick(choice){
  const div = document.createElement("div");
  div.innerText = `${name} เลือก ${choice}`;
  document.getElementById("log").appendChild(div);
}
