const container = document.getElementById("container");
const registerBtn = document.getElementById("register");
const loginBtn = document.getElementById("login");
const toggleContainer = document.querySelector(".toggle-container");
const signUpContainer = document.querySelector(".sign-up");
const signUpBtn = document.querySelector(".sign-up-btn");
const loginContainer = document.querySelector(".sign-in");
const signInBtn = document.querySelector(".sign-in-btn");

registerBtn.addEventListener("click", () => {
  container.classList.add("active");
});

loginBtn.addEventListener("click", () => {
  container.classList.remove("active");
});

document.addEventListener("DOMContentLoaded", function () {
  const inputFields = document.querySelectorAll("input");

  inputFields.forEach(function (input) {
    input.value = "";
  });

  if (innerWidth <= 767) {
    signUpContainer.style.display = "none";
    toggleContainer.style.display = "none";

    signUpBtn.addEventListener("click", () => {
      loginContainer.style.display = "none";
      signUpContainer.style.display = "block";
      container.classList.add("active");
    });

    signInBtn.addEventListener("click", () => {
      signUpContainer.style.display = "none";
      loginContainer.style.display = "block";
      container.classList.remove("active");
    });
  } else {
    signInBtn.style.display = "none";
    signUpBtn.style.display = "none";
  }
});
