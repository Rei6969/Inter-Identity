document.addEventListener("headerLoaded", () => {
  const btnHome = document.querySelector(".btn-home");
  const homeMain = document.querySelector(".home-main");
  const communityMain = document.querySelector(".community-main");
  const newsMain = document.querySelector(".news-main");
  const faqsMain = document.querySelector(".faqs-main");
  const aboutMain = document.querySelector(".about-main");

  const btnHomeNav = document.querySelector(".menu-nav .btn-home");

  btnHomeNav.style.background = "rgba(0, 0, 0, 0.5)";
  btnHomeNav.style.color = "white";

  btnHome.addEventListener("click", handleBtn);

  function handleBtn() {
    communityMain.style.display = "none";
    newsMain.style.display = "none";
    faqsMain.style.display = "none";
    aboutMain.style.display = "none";
    homeMain.style.display = "block";
  }
});
