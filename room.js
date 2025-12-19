const clickSound = new Audio("sounds/click.mp3");
const winSound   = new Audio("sounds/win.mp3");
const loseSound  = new Audio("sounds/lose.mp3");

function playClick(){
  clickSound.currentTime = 0;
  clickSound.play();
}

function play(p) {
  if (!playing) return;

  playClick(); // เสียงคลิก

  const arr = ["rock","paper","scissors"];
  const bot = arr[Math.floor(Math.random()*3)];
  round++;

  let text = "เสมอ";
  let isWin = false;
  let isLose = false;

  if (
    (p==="rock" && bot==="scissors") ||
    (p==="paper" && bot==="rock") ||
    (p==="scissors" && bot==="paper")
  ) {
    win++;
    text = "คุณชนะ 🎉";
    isWin = true;
  } else if (p !== bot) {
    lose++;
    text = "คุณแพ้ 😢";
    isLose = true;
  }

  document.getElementById("result").innerText =
    `คุณ ${icon(p)} | บอท ${icon(bot)} → ${text}`;

  updateUI();

  const card = document.querySelector(".card");

  if (isWin) {
    winSound.play();
    card.classList.add("win-glow");
    setTimeout(() => card.classList.remove("win-glow"), 400);
  }

  if (isLose) {
    loseSound.play();
    card.classList.add("shake");
    setTimeout(() => card.classList.remove("shake"), 400);
  }

  if ((mode === 1 && win === 1) || (mode === 2 && win === 2)) {
    endGame("🏆 คุณชนะเกม!");
  }
  if (mode === 2 && lose === 2) {
    endGame("💀 คุณแพ้เกม!");
  }
}
