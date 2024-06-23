document.addEventListener("DOMContentLoaded", function () {
  const headerNav = document.querySelector(".header-nav");
  const headerBtn = headerNav.querySelectorAll("a");

  headerBtn.forEach((button) => {
    button.addEventListener("click", handleBtn);
  });

  function handleBtn(event) {
    const btnName = event.target;

    headerBtn.forEach((button) => {
      button.style.textDecoration = "none";
    });

    if (btnName.className === "btn-profile") {
      btnName.style.textDecoration = "none";
    } else {
      btnName.style.textDecoration = "underline";
    }
  }

  // Menu Mobile

  let menuToggle = document.querySelector(".menu-toggle");
  const menuNav = document.querySelector(".menu-nav");
  const overlay = document.querySelector(".overlay");
  const body = document.querySelector("body");

  menuToggle.onclick = function () {
    menuToggle.classList.toggle("active");
    menuNav.classList.toggle("active");
    overlay.classList.toggle("active");

    body.style.overflow = menuNav.classList.contains("active")
      ? "hidden"
      : "auto";
  };
});
