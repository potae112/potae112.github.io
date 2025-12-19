const socket = io(); // same origin on Render

const $ = (id) => document.getElementById(id);
const toastEl = $("toast");

function toast(t) {
  toastEl.innerText = t;
  toastEl.style.display = "block";
  setTimeout(() => (toastEl.style.display = "none"), 1600);
}

function getName() {
  const name = $("name").value.trim();
  if (!name) {
    toast("ใส่ชื่อก่อน");
    return null;
  }
  localStorage.setItem("playerName", name);
  return name;
}

function loadName() {
  const n = localStorage.getItem("playerName") || "";
  $("name").value = n;
}
loadName();

function openModal(title, html) {
  $("modalTitle").innerText = title;
  $("modalContent").innerHTML = html;
  $("modalBack").style.display = "flex";
}
function closeModal() {
  $("modalBack").style.display = "none";
}
$("closeModal").onclick = closeModal;
$("modalBack").addEventListener("click", (e) => {
  if (e.target.id === "modalBack") closeModal();
});

function createRoom() {
  const name = getName();
  if (!name) return;
  const room = Math.floor(1000 + Math.random() * 9000);
  location.href = `room.html?room=${room}&name=${encodeURIComponent(name)}&mode=friend&owner=1`;
}

function joinRoom() {
  const name = getName();
  if (!name) return;
  const room = $("room").value.trim();
  if (!room) return toast("ใส่เลขห้องก่อน");
  location.href = `room.html?room=${encodeURIComponent(room)}&name=${encodeURIComponent(name)}&mode=friend`;
}

function spectateRoom() {
  const name = getName();
  if (!name) return;
  const room = $("room").value.trim();
  if (!room) return toast("ใส่เลขห้องก่อน");
  location.href = `room.html?room=${encodeURIComponent(room)}&name=${encodeURIComponent(name)}&mode=friend&role=spectator`;
}

function botMode() {
  const name = getName();
  if (!name) return;
  location.href = `room.html?room=BOT&name=${encodeURIComponent(name)}&mode=bot`;
}

// buttons
$("createBtn").onclick = createRoom;
$("joinBtn").onclick = joinRoom;
$("spectateBtn").onclick = spectateRoom;
$("botBtn").onclick = botMode;
$("saveNameBtn").onclick = () => {
  const n = getName();
  if (n) toast("บันทึกชื่อแล้ว");
  refreshProfile();
};

// server badge
socket.on("connect", () => {
  $("onlineBadge").innerText = "🟢 Server: connected";
});
socket.on("disconnect", () => {
  $("onlineBadge").innerText = "🔴 Server: disconnected";
});

function renderTop(list, elId, limit = 10) {
  const el = $(elId);
  el.innerHTML = "";
  list.slice(0, limit).forEach((p) => {
    const row = document.createElement("div");
    row.className = "item";
    row.innerHTML = `<div>#${p.rank} <b>${p.name}</b></div><div class="muted right">${p.exp} EXP</div>`;
    el.appendChild(row);
  });
}

function renderQuickTop(list) {
  const el = $("quickTop");
  el.innerHTML = "";
  list.slice(0, 5).forEach((p) => {
    const row = document.createElement("div");
    row.className = "item";
    row.innerHTML = `<div>🏅 <b>${p.name}</b></div><div class="muted right">${p.exp} EXP</div>`;
    el.appendChild(row);
  });
}

function refreshLeaderboard() {
  socket.emit("get_leaderboard");
}
socket.on("leaderboard", ({ leaderboard }) => {
  renderTop(leaderboard, "top10", 10);
  renderQuickTop(leaderboard);
});

function refreshProfile() {
  const name = (localStorage.getItem("playerName") || $("name").value || "").trim();
  if (!name) return;
  socket.emit("get_profile", { name });
}
socket.on("profile", ({ profile }) => {
  $("kExp").innerText = profile.exp;
  $("kW").innerText = profile.wins;
  $("kL").innerText = profile.losses;
});

function openLeaderboardModal() {
  socket.emit("get_leaderboard");
  openModal("🏅 Leaderboard", `<div class="muted">กำลังโหลด…</div>`);
}
$("openLeaderboard").onclick = openLeaderboardModal;

function openHistoryModal() {
  const name = getName();
  if (!name) return;
  openModal("🧾 Match History", `<div class="muted">กำลังโหลด…</div>`);
  socket.emit("get_history", { name });
}
$("openHistory").onclick = openHistoryModal;

socket.on("history", ({ history }) => {
  if (!history || !history.length) {
    $("modalContent").innerHTML = `<div class="muted">ยังไม่มีประวัติ</div>`;
    return;
  }
  const html = history.map(h => {
    const time = new Date(h.at).toLocaleString();
    const vs = h.mode === "bot"
      ? `vs <b>BOT</b>`
      : `vs <b>${h.enemyName || "Player"}</b>`;
    const res = h.result === "win" ? "🏆 WIN" : h.result === "lose" ? "💀 LOSE" : "😐 DRAW";
    return `<div class="item">
      <div>
        <div><b>${res}</b> ${vs}</div>
        <div class="muted">${time} • room ${h.room}</div>
      </div>
      <div class="right muted">${h.you} vs ${h.enemy}</div>
    </div>`;
  }).join("");
  $("modalContent").innerHTML = `<div class="list">${html}</div>`;
});

$("openHow").onclick = () => {
  openModal("🧠 วิธีเล่น/แชร์ลิงก์", `
    <div class="list">
      <div class="item"><div>👥 เล่นกับเพื่อน</div><div class="muted right">สร้างห้อง → ส่งเลขห้อง</div></div>
      <div class="item"><div>👀 Spectator</div><div class="muted right">ใส่เลขห้อง → ดูห้อง</div></div>
      <div class="item"><div>🤖 Bot โหด</div><div class="muted right">แพ้ 99% (EXP sync)</div></div>
      <div class="item"><div>🔗 แชร์ลิงก์ห้อง</div><div class="muted right">ในห้องมีปุ่ม Copy</div></div>
    </div>
  `);
};

$("refreshProfile").onclick = refreshProfile;
$("refreshBoard").onclick = refreshLeaderboard;

// init
refreshProfile();
refreshLeaderboard();
