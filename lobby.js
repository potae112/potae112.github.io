const socket = io();
let mode = "bo1";

document.querySelectorAll(".mode").forEach(b=>{
  b.onclick = ()=>{
    document.querySelectorAll(".mode").forEach(x=>x.classList.remove("active"));
    b.classList.add("active");
    mode = b.getAttribute("data");
  };
});

document.getElementById("create").onclick = ()=>{
  const room = Math.floor(1000 + Math.random()*9000);
  const name = localStorage.getItem("name");
  location.href = `room.html?room=${room}&name=${name}&mode=${mode}`;
};

socket.on("rooms-update", rooms=>{
  const box = document.getElementById("rooms");
  box.innerHTML = "";

  Object.keys(rooms).forEach(r=>{
    const div = document.createElement("div");
    div.className = "room";
    div.innerHTML = `
      <b>ROOM #${r}</b>
      <small>${rooms[r].players.join(", ")}</small>
      <button onclick="copy('${r}')">📋</button>
      <button onclick="join('${r}')">เข้า</button>
    `;
    box.appendChild(div);
  });
});

function join(room){
  const name = localStorage.getItem("name");
  location.href = `room.html?room=${room}&name=${name}`;
}

function copy(room){
  navigator.clipboard.writeText(room);
  alert("คัดลอกเลขห้องแล้ว");
}
