function createRoom(mode) {
  const name = document.getElementById("name").value;
  if (!name) return alert("ใส่ชื่อก่อน");

  const room = Math.floor(1000 + Math.random() * 9000);
  location.href = `room.html?room=${room}&name=${name}&mode=${mode}`;
}

function join() {
  const name = document.getElementById("name").value;
  const room = document.getElementById("room").value;
  if (!name || !room) return alert("กรอกให้ครบ");

  location.href = `room.html?room=${room}&name=${name}`;
}

function bot(mode) {
  const name = document.getElementById("name").value;
  if (!name) return alert("ใส่ชื่อก่อน");

  location.href = `room.html?bot=1&name=${name}&mode=${mode}`;
}
