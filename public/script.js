function createRoom() {
  const room = Math.floor(1000 + Math.random() * 9000);
  window.location.href = `room.html?room=${room}&mode=friend&owner=1`;
}

function joinRoom() {
  const room = document.getElementById("roomInput").value;
  if (!room) return alert("ใส่เลขห้องก่อน");
  window.location.href = `room.html?room=${room}&mode=friend`;
}

function playBot() {
  window.location.href = `room.html?mode=bot`;
}
