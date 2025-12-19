function createRoom() {
  const room = Math.floor(1000 + Math.random() * 9000);
  window.location.href = `room.html?room=${room}&owner=1`;
}

function joinRoom() {
  const room = document.getElementById("roomInput").value;
  if (!room) return alert("ใส่เลขห้อง");
  window.location.href = `room.html?room=${room}`;
}
