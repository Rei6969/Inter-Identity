document.addEventListener("DOMContentLoaded", function () {
  const prevButton = document.querySelector(".prev-btn");
  const nextButton = document.querySelector(".next-btn");
  const headerSection = document.querySelector(".main-header");
  const dots = document.querySelectorAll(".dot");
  const images = document.querySelectorAll(".header-img-container img");

  let currentImageIndex = 0;
  let scrollAmount = 0;
  let counter = 0;

  headerSection.scrollTo({
    top: 0,
    left: scrollAmount,
    behavior: "instant",
  });

  headerSection.addEventListener("scroll", function (e) {
    e.preventDefault();
  });

  function updateIndicator() {
    dots.forEach((dot, index) => {
      if (index === currentImageIndex) {
        dot.classList.add("active");
      } else {
        dot.classList.remove("active");
      }
    });
  }

  prevButton.addEventListener("click", () => {
    if (counter > 0) {
      counter--;
      scrollAmount -= headerSection.offsetWidth;
      headerSection.scrollTo({
        top: 0,
        left: scrollAmount,
        behavior: "smooth",
      });
      if (currentImageIndex > 0) {
        currentImageIndex--;
      } else {
        currentImageIndex = images.length - 1;
      }
      updateIndicator();
    }
  });

  nextButton.addEventListener("click", () => {
    if (counter < 2) {
      counter++;
      scrollAmount += headerSection.offsetWidth;
      headerSection.scrollTo({
        top: 0,
        left: scrollAmount,
        behavior: "smooth",
      });

      if (currentImageIndex < images.length - 1) {
        currentImageIndex++;
      } else {
        currentImageIndex = 0;
      }
      updateIndicator();
    }
  });
});
