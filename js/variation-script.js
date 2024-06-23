document.addEventListener("DOMContentLoaded", function () {
  const cardsContainer = document.querySelector(".cards-container");

  loadCards();

  console.log(`Current width:`, window.innerWidth);

  function loadCards() {
    fetch("./html/variation-cards.html")
      .then((response) => response.text())
      .then((data) => {
        cardsContainer.innerHTML = data;
      })
      .catch((error) => {
        console.log("Error:", error);
      });
  }

  let btnArrow = null;
  let allIconArrows = null;

  cardsContainer.addEventListener("click", function (event) {
    btnArrow = event.target.closest(".icon-arrow");
    console.log(event);

    allIconArrows = document.querySelectorAll(".icon-arrow");

    if (btnArrow) {
      const variationName = btnArrow.getAttribute("name");
      handleBtn(variationName);
    }
  });

  let currentVariation = null;

  function handleBtn(variationName) {
    const variationContainer = document.querySelector(".variation-section");
    if (currentVariation == variationName) {
      variationContainer.innerHTML = "";
      currentVariation = null;
      btnArrow.src = "./media/images/icons8-chevron-right.png";
    } else {
      fetch(`./html/variations/${variationName}.html`)
        .then((response) => response.text())
        .then((html) => {
          variationContainer.innerHTML = "";

          allIconArrows.forEach(function (iconArrow) {
            iconArrow.src = "./media/images/icons8-chevron-right.png";
          });

          btnArrow.src = "./media/images/icons8-chevron-down.png";

          const tempContainer = document.createElement("div");
          tempContainer.innerHTML = html.trim();

          variationContainer.style.display = "block";

          tempContainer.childNodes.forEach((child) => {
            variationContainer.appendChild(child.cloneNode(true));
          });

          currentVariation = variationName;
        })
        .catch((error) => {
          console.error("Error fetching HTML:", error);
        });
    }
  }
});
