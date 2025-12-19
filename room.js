const q = new URLSearchParams(location.search);
const room = q.get("room") || "BOT";
const name = q.get("name");
const mode = Number(q.get("mode") || 1);
const isBot = q.get("bot");

let myScore = 0;
let enemyScore = 0;
let winNeed = mode === 1 ? 1 : 2;

document.getElementById("roomTitle").innerText = "ROOM #" + room;
document.getElementById("modeText").innerText =
  mode === 1 ? "🎯 1 เป้าจบ" : "🥊 2 ใน 3";

const socket = io();

if (!isBot) {
  socket.emit("joinRoom", { room, name });
}

function pick(choice) {
  if (isBot) return botFight(choice);
  socket.emit("choice", choice);
}

socket.on("result", data => {
  let win =
    (data.result === "A" && data.a.name === name) ||
    (data.result === "B" && data.b.name === name);

  if (win) myScore++;
  else if (data.result !== "draw") enemyScore++;

  updateUI(win);
  checkEnd();
});

function botFight(my) {
  const lose = Math.random() < 0.99;
  if (!lose) myScore++;
  else enemyScore++;

  updateUI(!lose);
  checkEnd();
}

function updateUI(win) {
  document.getElementById("me").innerText = myScore;
  document.getElementById("enemy").innerText = enemyScore;
  document.getElementById("result").innerText =
    win ? "🏆 YOU WIN" : "💀 YOU LOSE";

  new Audio(win ? "sounds/win.mp3" : "sounds/lose.mp3").play();
}

function checkEnd() {
  if (myScore >= winNeed || enemyScore >= winNeed) {
    setTimeout(() => {
      alert(myScore > enemyScore ? "🏆 ชนะเกม!" : "💀 แพ้เกม!");
      location.href = "/";
    }, 500);
  }
}

function send() {
  socket.emit("chat", msg.value);
  msg.value = "";
}

socket.on("chat", d => {
  chatBox.innerHTML += `<div><b>${d.name}:</b> ${d.msg}</div>`;
});
