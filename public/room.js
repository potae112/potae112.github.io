const params = new URLSearchParams(window.location.search);
const mode = params.get("mode");
const room = params.get("room");

const title = document.getElementById("roomTitle");
const countdownEl = document.getElementById("countdown");
const resultEl = document.getElementById("result");

if (room) title.innerText = `ROOM #${room}`;
else title.innerText = "BOT MODE";

let count = 3;
const timer = setInterval(() => {
  countdownEl.innerText = count;
  count--;
  if (count < 0) {
    clearInterval(timer);
    countdownEl.innerText = "GO!";
  }
}, 1000);

function copyLink() {
  navigator.clipboard.writeText(window.location.href);
  alert("คัดลอกลิงก์แล้ว");
}

function pick(player) {
  if (mode === "bot") {
    botFight(player);
  } else {
    resultEl.innerText = "⌛ รอผู้เล่นอีกฝั่ง (demo)";
  }
}

function botFight(player) {
  const lose99 = Math.random() < 0.99;

  let bot;
  if (lose99) {
    bot = player === "rock" ? "paper"
        : player === "paper" ? "scissors"
        : "rock";
  } else {
    bot = ["rock","paper","scissors"][Math.floor(Math.random()*3)];
  }

  resultEl.innerText = `คุณ: ${player} | บอท: ${bot} → ❌ คุณแพ้`;
}
