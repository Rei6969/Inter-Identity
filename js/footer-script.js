document.addEventListener("DOMContentLoaded", function () {
  const footerContainer = this.querySelector(".footer-container");

  loadCards();

  function loadCards() {
    fetch("./../html/footer.html")
      .then((response) => response.text())
      .then((data) => {
        footerContainer.innerHTML = data;
      })
      .catch((error) => {
        console.log("Error:", error);
      });
  }
});
