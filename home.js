const socket = io();

function enterLobby(){
  const name = document.getElementById("name").value.trim();
  if(!name) return alert("ใส่ชื่อก่อน");

  localStorage.setItem("name",name);

  document.querySelector(".login-card").classList.add("hidden");
  document.getElementById("lobby").classList.remove("hidden");
  document.getElementById("player-name").textContent = name;

  socket.emit("join-lobby",name);
}

socket.on("room-list", rooms=>{
  const list = document.getElementById("room-list");
  list.innerHTML = "";

  Object.values(rooms).forEach(r=>{
    const div = document.createElement("div");
    div.className="room";
    div.innerHTML=`
      <div>
        <b>ROOM #${r.id}</b>
        <div class="info">${r.players}/2 • ${r.status}</div>
      </div>
      <div>
        <button onclick="join(${r.id})">เข้า</button>
        <button class="spec" onclick="spectate(${r.id})">ดู</button>
      </div>`;
    list.appendChild(div);
  });
});

function join(id){
  location.href=`room.html?room=${id}&name=${localStorage.getItem("name")}`;
}
function spectate(id){
  location.href=`room.html?room=${id}&name=${localStorage.getItem("name")}&spectator=true`;
}
