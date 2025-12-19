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
