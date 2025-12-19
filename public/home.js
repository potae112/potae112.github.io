function createRoom(){
  const room = Math.floor(1000 + Math.random()*9000);
  localStorage.setItem("roomOwner", room);
  location.href = `room.html?room=${room}&owner=1`;
}

function joinRoom(){
  const room = document.getElementById("roomInput").value;
  if(!room) return alert("ใส่เลขห้องก่อน");
  location.href = `room.html?room=${room}`;
}
// ===== Rank System =====
let exp = Number(localStorage.getItem("exp") || 0);
let rank = "Bronze";

function calcRank(){
  if(exp >= 100) rank = "Gold";
  else if(exp >= 50) rank = "Silver";
  else rank = "Bronze";
  document.getElementById("rankText").innerText =
    `${rank} (${exp} EXP)`;
}
calcRank();

// ===== History =====
let history = JSON.parse(localStorage.getItem("history") || "[]");
function addHistory(text){
  history.unshift(text);
  history = history.slice(0,10);
  localStorage.setItem("history",JSON.stringify(history));
}
function renderHistory(){
  const ul = document.getElementById("historyList");
  ul.innerHTML = "";
  history.forEach(h=>{
    const li=document.createElement("li");
    li.textContent=h;
    ul.appendChild(li);
  });
}

// ===== Bot โหด 99% =====
function playHardBot(){
  const lose = Math.random() < 0.99;
  if(lose){
    addHistory("แพ้บอทโหด 😭");
  }else{
    exp += 10;
    localStorage.setItem("exp",exp);
    addHistory("ชนะบอทโหด 😱 +10 EXP");
  }
  calcRank();
  renderHistory();
  alert("เล่นกับบอทโหดเสร็จ!");
}

// ===== Modal =====
function openModal(id){
  document.getElementById(id).style.display="flex";
  if(id==="historyModal") renderHistory();
  if(id==="rankModal") calcRank();
}
function closeModal(){
  document.querySelectorAll(".modal")
    .forEach(m=>m.style.display="none");
}
