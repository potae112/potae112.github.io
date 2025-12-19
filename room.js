const params = new URLSearchParams(location.search);
const room = params.get("room") || "BOT";
const name = params.get("name") || "Player";
let rank = 1000;
let mode = 1;

document.getElementById("roomTitle").innerText = `ROOM #${room}`;

function setMode(m) {
  mode = m;
  alert(`โหมด ${m === 1 ? "1 เกมจบ" : "2 ใน 3"}`);
}

function play(choice) {
  const bot = ["rock","paper","scissors"][Math.floor(Math.random()*3)];
  let res = "เสมอ";

  if (
    (choice==="rock" && bot==="scissors") ||
    (choice==="paper" && bot==="rock") ||
    (choice==="scissors" && bot==="paper")
  ) {
    res = "ชนะ";
    rank += 10;
  } else if (choice !== bot) {
    res = "แพ้";
    rank -= 10;
  }

  document.getElementById("rank").innerText = rank;
  document.getElementById("result").innerText =
    `คุณ: ${choice} | ฝั่งตรงข้าม: ${bot} → ${res}`;
}

function send() {
  const msg = document.getElementById("msg");
  const box = document.getElementById("messages");
  box.innerHTML += `<div><b>${name}:</b> ${msg.value}</div>`;
  msg.value = "";
}
