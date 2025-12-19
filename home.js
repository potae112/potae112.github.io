function createRoom() {
  const name = document.getElementById("name").value || "Guest";
  const id = Math.floor(1000 + Math.random() * 9000);
  location.href = `room.html?room=${id}&name=${name}`;
}

function join() {
  const name = document.getElementById("name").value || "Guest";
  const room = document.getElementById("room").value;
  location.href = `room.html?room=${room}&name=${name}`;
}

function bot() {
  location.href = `room.html?bot=true&name=You`;
}
