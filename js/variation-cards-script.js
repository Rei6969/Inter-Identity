document.addEventListener("DOMContentLoaded", function () {
  const cardsContainer = this.querySelector(".cards-container");

  loadCards();

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
});
