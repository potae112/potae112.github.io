const q = new URLSearchParams(location.search);
const name = q.get("name") || "Guest";
const isBot = q.get("bot");

let mode = 1;
let win = 0, lose = 0;
let rank = 1000;

document.getElementById("roomTitle").innerText =
  isBot ? "ROOM #BOT" : "ROOM #" + (q.get("room")||"???");

function setMode(n){
  mode = n;
  win = lose = 0;
  status("โหมด " + (n===1?"1 เกมจบ":"2 ใน 3"));
}

function play(me){
  const bot = ["rock","paper","scissors"][Math.floor(Math.random()*3)];
  let result = "";

  if(me===bot) result="เสมอ";
  else if(
    (me==="rock" && bot==="scissors") ||
    (me==="paper" && bot==="rock") ||
    (me==="scissors" && bot==="paper")
  ){
    result="ชนะ";
    win++;
    rank+=10;
    document.getElementById("win").play();
  }else{
    result="แพ้";
    lose++;
    rank-=10;
    document.getElementById("lose").play();
  }

  document.getElementById("rank").innerText = rank;

  if(mode===1 || win===2 || lose===2){
    status(`คุณ${result} (${me} vs ${bot})`);
  }else{
    status(`รอบต่อไป (${me} vs ${bot})`);
  }
}

function status(t){
  document.getElementById("status").innerText = t;
}

function send(){
  const m = document.getElementById("msg");
  if(!m.value) return;
  document.getElementById("chat").innerHTML +=
    `<div><b>${name}:</b> ${m.value}</div>`;
  m.value="";
}
