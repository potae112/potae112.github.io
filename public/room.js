const params = new URLSearchParams(window.location.search);
const mode = params.get("mode") || "bot";
const room = params.get("room");
const owner = params.get("owner") === "1";

const card = document.getElementById("card");
const title = document.getElementById("roomTitle");
const countdownEl = document.getElementById("countdown");
const resultEl = document.getElementById("result");
const hintEl = document.getElementById("hint");
const modeText = document.getElementById("modeText");
const rankMini = document.getElementById("rankMini");

const KEY = "rps_stats_v1";
function loadStats(){
  return JSON.parse(localStorage.getItem(KEY) || '{"wins":0,"losses":0,"draws":0,"streak":0,"bestStreak":0,"points":0}');
}
function saveStats(s){ localStorage.setItem(KEY, JSON.stringify(s)); }
function rankFromPoints(p){
  if (p >= 1200) return "👑 LEGEND";
  if (p >= 800) return "🔥 DIAMOND";
  if (p >= 500) return "💎 GOLD";
  if (p >= 250) return "🥈 SILVER";
  return "🥉 BRONZE";
}
function refreshMini(){
  const s = loadStats();
  rankMini.innerText = `🏆 ${rankFromPoints(s.points)} • ⭐${s.points}`;
}
refreshMini();

if (room) title.innerText = `ROOM #${room}`;
else title.innerText = "BOT MODE";

modeText.innerText = mode === "bot" ? "โหมด: 🤖 บอทโหด" : "โหมด: 👥 เล่นกับเพื่อน";
hintEl.innerText = (mode === "friend")
  ? "ตอนนี้เป็น demo (ยังไม่ sync 2 คนจริง) — ถ้าจะเอา realtime เดี๋ยวต่อ Socket.IO ให้"
  : "บอทโหด: คุณจะแพ้ ~99% 😈";

// ===== Sounds =====
const sfx = {
  click: new Audio("sounds/click.mp3"),
  win: new Audio("sounds/win.mp3"),
  lose: new Audio("sounds/lose.mp3"),
  draw: new Audio("sounds/draw.mp3"),
};
function safePlay(a){
  if(!a || !a.play) return;
  a.currentTime = 0;
  a.play().catch(()=>{});
}

// ===== Countdown =====
let playing = false;
let count = 3;
const timer = setInterval(() => {
  countdownEl.innerText = count;
  count--;
  if (count < 0) {
    clearInterval(timer);
    countdownEl.innerText = "GO!";
    playing = true;
  }
}, 1000);

function backHome(){
  window.location.href = "index.html";
}

function copyLink() {
  navigator.clipboard.writeText(window.location.href);
  alert("คัดลอกลิงก์แล้ว");
}

function vibrateLose(){
  if (navigator.vibrate) navigator.vibrate([80,40,80,40,120]);
}

function setAnim(type){
  card.classList.remove("popWin","popLose","shake");
  void card.offsetWidth; // restart animation
  if(type === "win") card.classList.add("popWin");
  if(type === "lose"){ card.classList.add("shake"); card.classList.add("popLose"); }
  if(type === "draw") card.classList.add("popLose");
}

function icon(p){
  return p==="rock"?"✊":p==="paper"?"✋":"✌️";
}

function judge(player, bot){
  if(player === bot) return "draw";
  if(
    (player==="rock" && bot==="scissors") ||
    (player==="paper" && bot==="rock") ||
    (player==="scissors" && bot==="paper")
  ) return "win";
  return "lose";
}

function addStat(outcome){
  const s = loadStats();
  if(outcome==="win"){
    s.wins++; s.streak++;
    s.points += 25;
  } else if(outcome==="lose"){
    s.losses++; s.streak = 0;
    s.points = Math.max(0, s.points - 15);
  } else {
    s.draws++;
    s.points += 2;
  }
  s.bestStreak = Math.max(s.bestStreak, s.streak);
  saveStats(s);
  refreshMini();
}

function pick(player) {
  if (!playing) return;
  safePlay(sfx.click);

  if (mode === "bot") return botFight(player);

  // friend demo
  resultEl.innerText = `คุณเลือก ${icon(player)} — (demo) ยังไม่ sync 2 คนจริง`;
  setAnim("draw");
}

function botFight(player) {
  // โอกาสให้คุณชนะ 1% (ตามที่ขอ)
  const youWin1 = Math.random() < 0.01;

  let bot;
  if (youWin1) {
    // ทำให้ "คุณชนะ"
    bot = player === "rock" ? "scissors"
        : player === "paper" ? "rock"
        : "paper";
  } else {
    // ทำให้ "คุณแพ้" 99%
    bot = player === "rock" ? "paper"
        : player === "paper" ? "scissors"
        : "rock";
  }

  const outcome = judge(player, bot);

  if(outcome === "win"){
    safePlay(sfx.win);
    setAnim("win");
    resultEl.innerText = `คุณ: ${icon(player)} | บอท: ${icon(bot)} → ✅ คุณชนะ!`;
  } else if(outcome === "lose"){
    safePlay(sfx.lose);
    vibrateLose();
    setAnim("lose");
    resultEl.innerText = `คุณ: ${icon(player)} | บอท: ${icon(bot)} → ❌ คุณแพ้!`;
  } else {
    safePlay(sfx.draw);
    setAnim("draw");
    resultEl.innerText = `คุณ: ${icon(player)} | บอท: ${icon(bot)} → 🤝 เสมอ`;
  }

  addStat(outcome);
}
