document.addEventListener("DOMContentLoaded", function () {
  const headerContainer = document.getElementById("header-container");

  loadHeader();

  function loadHeader() {
    fetch("./../html/header.html")
      .then((response) => response.text())
      .then((data) => {
        headerContainer.innerHTML = data;
        document.dispatchEvent(new Event("headerLoaded"));
      })
      .catch((error) => {
        console.log("Error:", error);
      });
  }
});
