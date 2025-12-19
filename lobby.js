let mode = "bo1";

document.querySelectorAll(".mode").forEach(b=>{
  b.onclick=()=>{
    document.querySelectorAll(".mode").forEach(x=>x.classList.remove("active"));
    b.classList.add("active");
    mode = b.getAttribute("data");
  };
});

document.getElementById("create").onclick=()=>{
  const room = Math.floor(1000+Math.random()*9000);
  const name = localStorage.getItem("name");
  location.href = `room.html?room=${room}&mode=${mode}&name=${name}`;
};
