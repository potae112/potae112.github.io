const items = ["rock","paper","scissors"];

function play(playerPick){
  const botPick = items[Math.floor(Math.random()*3)];

  document.getElementById("player").innerText =
    "คุณ: " + icon(playerPick);
  document.getElementById("bot").innerText =
    "บอท: " + icon(botPick);

  let text = "เสมอ 😐";

  if(
    (playerPick==="rock" && botPick==="scissors") ||
    (playerPick==="paper" && botPick==="rock") ||
    (playerPick==="scissors" && botPick==="paper")
  ){
    text = "คุณชนะ 🎉";
  }else if(playerPick !== botPick){
    text = "คุณแพ้ 😢";
  }

  document.getElementById("result").innerText = text;
}

function icon(p){
  if(p==="rock") return "✊";
  if(p==="paper") return "🖐️";
  if(p==="scissors") return "✌️";
  return "-";
}
