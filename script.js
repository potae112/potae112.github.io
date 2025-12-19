const socket = io();

/* ===== Params ===== */
const params = new URLSearchParams(location.search);
const room = params.get("room") || "BOT";
const name = params.get("name") || "Guest";
const spectator = params.get("spectator") === "true";

document.getElementById("room-id").textContent = room;

/* ===== Join ===== */
socket.emit("join-room", { room, name, spectator });

/* ===== Chat receive ===== */
socket.on("chat", data => {
  addMessage(data.name, data.msg, data.role);
});

/* ===== System ===== */
socket.on("system-message", data => {
  addSystem(data.text);
});

/* ===== Send ===== */
function send(){
  const input = document.getElementById("msg");
  if(!input.value.trim()) return;

  socket.emit("chat", input.value);
  handleBot(input.value); // 🧠 bot trigger
  input.value = "";
}

/* ===== Bot logic ===== */
function handleBot(text){
  const t = text.toLowerCase();

  let reply = null;

  if(t.includes("ช่วย") || t.includes("help")){
    reply = "พิมพ์: rank / วิธีเล่น / bot / ping";
  }
  else if(t.includes("rank")){
    reply = "Rank ของคุณ = 1000 🏆";
  }
  else if(t.includes("วิธีเล่น")){
    reply = "เลือก ✊ ✋ ✌ ใครชนะได้แต้ม";
  }
  else if(t.includes("ping")){
    reply = "pong 🏓";
  }
  else if(t.includes("bot")){
    reply = "ผมคือบอท RPS 🤖";
  }

  if(reply){
    setTimeout(()=>{
      addMessage("BOT", reply, "bot");
    },500);
  }
}

/* ===== UI helpers ===== */
function addMessage(user,msg,role){
  const log = document.getElementById("log");
  const div = document.createElement("div");

  let cls = "msg ";
  cls += role || (user==="BOT" ? "bot" : spectator ? "spectator":"player");

  div.className = cls;
  div.innerHTML = `<b>${user}</b>: ${msg}`;

  log.appendChild(div);
  log.scrollTop = log.scrollHeight;
}

function addSystem(text){
  const log = document.getElementById("log");
  const div = document.createElement("div");
  div.className = "msg system";
  div.textContent = text;
  log.appendChild(div);
  log.scrollTop = log.scrollHeight;
}

/* ===== Enter ===== */
document.getElementById("msg").addEventListener("keydown",e=>{
  if(e.key==="Enter") send();
});
