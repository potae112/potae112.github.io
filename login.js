// js/login.js
function login(){
  const name = document.getElementById("name").value.trim();
  if(!name) return alert("ใส่ชื่อก่อน");
  localStorage.setItem("rps_name", name);
  location.href = "lobby.html";
}
