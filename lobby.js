const q = new URLSearchParams(location.search);
const name = q.get("name");

const socket = io();
socket.emit("login", name);

socket.on("rooms", rooms => {
  const box = document.getElementById("rooms");
  box.innerHTML = "";

  if(rooms.length===0){
    box.innerHTML = "<div class='info'>ยังไม่มีห้อง</div>";
    return;
  }

  rooms.forEach(r=>{
    const div = document.createElement("div");
    div.className = "btn";
    div.innerHTML = `
      🎮 ROOM #${r.id}<br>
      👤 ${r.players.join(", ")}<br>
      ⚙️ ${r.mode}
    `;
    div.onclick = ()=>{
      location.href = `room.html?room=${r.id}&name=${name}&spectator=true`;
    };
    box.appendChild(div);
  });
});

function createRoom(){
  socket.emit("create-room");
}
