const menuButton = document.querySelector(".menu-toggle");
const nav = document.querySelector(".site-nav");
const yearNode = document.querySelector("#year");

if (menuButton && nav) {
  menuButton.addEventListener("click", () => {
    const expanded = menuButton.getAttribute("aria-expanded") === "true";
    menuButton.setAttribute("aria-expanded", String(!expanded));
    nav.classList.toggle("open");
  });
}

if (yearNode) {
  yearNode.textContent = String(new Date().getFullYear());
}
