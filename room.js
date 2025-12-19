const socket = io();

const params = new URLSearchParams(location.search);
const room = params.get("room");
const name = params.get("name") || (localStorage.getItem("playerName") || "Guest");
const mode = params.get("mode") || (room === "BOT" ? "bot" : "friend");
const role = params.get("role") === "spectator" ? "spectator" : "player";

localStorage.setItem("playerName", name);

const $ = (id) => document.getElementById(id);

$("roomTitle").innerText = room === "BOT" ? "🤖 BOT MODE" : `ROOM #${room}`;
$("subTitle").innerText = `mode: ${mode} • name: ${name}`;
$("roleBadge").innerText = `role: ${role}`;

function setPickButtonsEnabled(enabled) {
  ["btnRock","btnPaper","btnScissors"].forEach(id => {
    $(id).disabled = !enabled;
  });
}

function pick(p) {
  if (role === "spectator") return;
  setPickButtonsEnabled(false);
  $("status").innerText = "ส่งตัวเลือกแล้ว…";
  socket.emit("pick", { pick: p });
}

$("btnRock").onclick = () => pick("rock");
$("btnPaper").onclick = () => pick("paper");
$("btnScissors").onclick = () => pick("scissors");

$("copyLinkBtn").onclick = async () => {
  const url = location.href;
  try {
    await navigator.clipboard.writeText(url);
    $("subTitle").innerText = "คัดลอกลิงก์แล้ว ✅";
    setTimeout(() => $("subTitle").innerText = `mode: ${mode} • name: ${name}`, 1400);
  } catch {
    prompt("คัดลอกลิงก์เอง:", url);
  }
};

// chat
function addChatLine(from, text, tag) {
  const box = $("chatBox");
  const div = document.createElement("div");
  div.className = "chatmsg";
  div.innerHTML = `<b>${from}</b> <span class="muted">${tag||""}</span> : ${escapeHTML(text)}`;
  box.appendChild(div);
  box.scrollTop = box.scrollHeight;
}
function escapeHTML(s) {
  return String(s).replace(/[&<>"']/g, c => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
  }[c]));
}
$("sendBtn").onclick = () => {
  const t = $("msg").value.trim();
  if (!t) return;
  socket.emit("chat", { text: t });
  $("msg").value = "";
};
$("msg").addEventListener("keydown", (e) => {
  if (e.key === "Enter") $("sendBtn").click();
});

// join
socket.on("connect", () => {
  socket.emit("join_room", { room, name, role, mode });
});

socket.on("joined", (info) => {
  if (!info.ok) return;
  $("roleBadge").innerText = `role: ${info.role}${info.slot ? `(${info.slot})` : ""}`;
  if (info.role === "spectator") {
    $("status").innerText = "👀 โหมดผู้ชม";
    setPickButtonsEnabled(false);
  } else {
    $("status").innerText = "เลือก!";
    setPickButtonsEnabled(true);
  }
});

socket.on("room_state", (st) => {
  const A = st.players.A ? st.players.A.name : "-";
  const B = st.players.B ? st.players.B.name : "-";
  $("playersLine").innerText = `A: ${A}  |  B: ${B}  |  round: ${st.round}`;
  $("specBadge").innerText = `👀 ${st.spectatorsCount}`;

  const list = $("spectatorList");
  list.innerHTML = "";
  if (!st.spectators || st.spectators.length === 0) {
    list.innerHTML = `<div class="item"><div class="muted">ยังไม่มีคนดู</div><div class="muted right">—</div></div>`;
  } else {
    st.spectators.slice(0, 30).forEach((n, i) => {
      const row = document.createElement("div");
      row.className = "item";
      row.innerHTML = `<div>👀 ${escapeHTML(n)}</div><div class="muted right">#${i+1}</div>`;
      list.appendChild(row);
    });
  }
});

socket.on("picked_state", (ps) => {
  $("pickedState").innerText = `A: ${ps.A ? "✅" : "—"} | B: ${ps.B ? "✅" : "—"}`;
  if (ps.A && ps.B) $("status").innerText = "⚡ กำลังตัดสินผล…";
});

socket.on("round_result", (payload) => {
  $("countdown").innerText = "";

  // friend mode
  if (payload.mode === "friend") {
    const me = payload.A.name === name ? payload.A : payload.B;
    const other = payload.A.name === name ? payload.B : payload.A;

    $("status").innerText = `คุณ: ${me.pick} | อีกฝ่าย: ${other.pick}`;
    $("result").innerText =
      me.result === "win" ? "🏆 YOU WIN!" :
      me.result === "lose" ? "💀 YOU LOSE!" : "😐 DRAW";

    if (me.result === "win") $("win").play().catch(()=>{});
    if (me.result === "lose") $("lose").play().catch(()=>{});

    addChatLine("SYSTEM", `ผลรอบนี้: ${payload.A.name}(${payload.A.pick}) vs ${payload.B.name}(${payload.B.pick})`, "(result)");
    setPickButtonsEnabled(false);
    return;
  }

  // bot mode
  if (payload.mode === "bot") {
    $("status").innerText = `คุณ: ${payload.you.pick} | BOT: ${payload.enemy.pick}`;
    $("result").innerText =
      payload.result === "win" ? "🏆 YOU WIN!" :
      payload.result === "lose" ? "💀 YOU LOSE!" : "😐 DRAW";

    if (payload.result === "win") $("win").play().catch(()=>{});
    if (payload.result === "lose") $("lose").play().catch(()=>{});

    addChatLine("SYSTEM", `ผล: ${payload.you.name}(${payload.you.pick}) vs BOT(${payload.enemy.pick})`, "(bot)");
    setPickButtonsEnabled(false);
  }
});

socket.on("countdown", ({ left }) => {
  $("countdown").innerText = `เริ่มรอบใหม่ใน ${left}…`;
});

socket.on("round_reset", () => {
  $("result").innerText = "";
  $("pickedState").innerText = `A: — | B: —`;
  $("status").innerText = role === "spectator" ? "👀 โหมดผู้ชม" : "เลือก!";
  if (role !== "spectator") setPickButtonsEnabled(true);
});

socket.on("chat_msg", (m) => {
  const tag = m.role === "spectator" ? "(spectator)" : "";
  addChatLine(m.from, m.text, tag);
});
