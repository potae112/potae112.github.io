<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="UTF-8" />
  <title>RPS Online</title>
  <link rel="stylesheet" href="style.css">
</head>
<body class="bg">
  <div class="home-card" id="card">
    <h1 class="title">✊✋✌️ RPS ONLINE</h1>
    <p class="subtitle">Real-time • เล่นกับเพื่อน • บอทโหด</p>

    <div class="badge">
      <span id="rankText">🏆 Rank: -</span>
      <span>•</span>
      <span id="pointText">⭐ Points: 0</span>
    </div>

    <div class="stats">
      <div class="statBox"><b>ชนะ</b><span id="wins">0</span></div>
      <div class="statBox"><b>แพ้</b><span id="losses">0</span></div>
      <div class="statBox"><b>เสมอ</b><span id="draws">0</span></div>
      <div class="statBox"><b>สตรีคชนะ</b><span id="streak">0</span></div>
    </div>

    <hr class="sep"/>

    <div class="mode-box">
      <button class="btn primary" onclick="createRoom()">👥 เล่นกับเพื่อน</button>
      <button class="btn danger" onclick="playBot()">🤖 เล่นกับบอทโหด (แพ้ 99%)</button>
    </div>

    <div class="join-box">
      <input id="roomInput" placeholder="ใส่เลขห้อง">
      <button class="btn ghost" onclick="joinRoom()">เข้าห้อง</button>
    </div>

    <div style="margin-top:14px;display:flex;gap:10px;justify-content:center;">
      <button class="btn ghost" onclick="resetStats()">🧹 ล้างสถิติ</button>
      <button class="btn ghost" onclick="testClickSound()">🔊 เทสเสียง</button>
    </div>

    <p class="small">*เสียงจะดังเมื่อมีการคลิกก่อน (กัน autoplay)</p>
  </div>

  <script src="script.js"></script>
</body>
</html>
