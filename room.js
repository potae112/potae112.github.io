const socket = io();
const q = new URLSearchParams(location.search);

const room = q.get("room");
const name = q.get("name");
const mode = q.get("mode");

const winScore = mode==="bo3"?2:1;

document.getElementById("title").innerText=`ROOM #${room} | ${name}`;

socket.emit("join-room",{room,name,mode});

function play(m){
  socket.emit("play",m);
}

socket.on("round-result", r=>{
  score.innerText = `${r.a.name} ${r.a.score} : ${r.b.score} ${r.b.name}`;

  if(r.winner===name){
    win.play();
  }else if(r.winner!=="draw"){
    lose.play();
  }

  result.innerText =
    `${r.a.name}:${r.a.move} vs ${r.b.name}:${r.b.move} → ${r.winner}`;
});

function send(){
  if(!msg.value) return;
  socket.emit("chat",msg.value);
  msg.value="";
}

socket.on("chat", m=>{
  log.innerHTML+=`<div><b>${m.name}</b>: ${m.msg}</div>`;
  log.scrollTop=log.scrollHeight;
});
