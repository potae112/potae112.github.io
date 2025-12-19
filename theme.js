const btn = document.getElementById("themeToggle");
btn.onclick = () => {
  const body = document.body;
  body.dataset.theme =
    body.dataset.theme === "dark" ? "white" : "dark";
};
