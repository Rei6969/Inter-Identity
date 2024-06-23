// document.addEventListener("DOMContentLoaded", function () {
//   const btnAbout = document.querySelector(".btn-about");
//   const homeMain = document.querySelector(".home-main");
//   const communityMain = document.querySelector(".community-main");
//   const newsMain = document.querySelector(".news-main");
//   const faqsMain = document.querySelector(".faqs-main");
//   const aboutMain = document.querySelector(".about-main");

//   btnAbout.addEventListener("click", handleBtn);

//   function handleBtn() {
//     homeMain.style.display = "none";
//     communityMain.style.display = "none";
//     newsMain.style.display = "none";
//     faqsMain.style.display = "none";
//     aboutMain.style.display = "block";

//     fetch("./html/about.html")
//       .then((response) => response.text())
//       .then((data) => {
//         aboutMain.innerHTML = data;
//       })
//       .catch((error) => {
//         console.log("Error:", error);
//       });
//   }
// });
