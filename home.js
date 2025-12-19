function createRoom() {
  const name = document.getElementById("name").value;
  const id = Math.floor(1000 + Math.random()*9000);
  location.href = `room.html?room=${id}&name=${name}`;
}

function join() {
  const name = document.getElementById("name").value;
  const room = document.getElementById("room").value;
  location.href = `room.html?room=${room}&name=${name}`;
}

function bot() {
  alert("บอทยังต่อเพิ่มได้ (logic แยก)");
}
