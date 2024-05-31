import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  setPersistence,
  browserSessionPersistence,
} from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js";
import {
  getDatabase,
  ref,
  set,
} from "https://www.gstatic.com/firebasejs/10.11.1/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyAPgWFqszS_2o_40rIUbZhSDPgsxl3u5n0",
  authDomain: "interidentity-90d32.firebaseapp.com",
  databaseURL: "https://interidentity-90d32-default-rtdb.firebaseio.com",
  projectId: "interidentity-90d32",
  storageBucket: "interidentity-90d32.appspot.com",
  messagingSenderId: "564846928127",
  appId: "1:564846928127:web:abf02f06edd576fcd12cca",
};

const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);
const database = getDatabase();

// sessionStorage.clear();

window.onload = function () {
  if (sessionStorage.getItem("isLoggedIn")) {
    window.location.href = "./../index.html";
  }
};

setPersistence(auth, browserSessionPersistence)
  .then(() => {
    document.getElementById("btn-login").addEventListener("click", login);
    document.getElementById("btn-signup").addEventListener("click", register);
    document
      .getElementById("btn-forgot-password")
      .addEventListener("click", resetPassword);

    function login() {
      const email = document.getElementById("loginEmail").value;
      const password = document.getElementById("loginPassword").value;

      signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
          const user = userCredential.user;
          if (user.emailVerified) {
            sessionStorage.setItem("isLoggedIn", true);
            window.location.href = "./../index.html";
          } else {
            alert("Please verify your email before logging in.");
          }
        })
        .catch((error) => {
          const errorMessage = error.message;
          alert(errorMessage);
        });
    }

    function register() {
      const fName = document.getElementById("signup-fName").value;
      const lName = document.getElementById("signup-lName").value;
      const email = document.getElementById("signup-email").value;
      const password = document.getElementById("signup-pWord").value;
      const cpWord = document.getElementById("signup-cpWord").value;
      const age = document.getElementById("signup-age").value;
      const gender = document.getElementById("signup-gender").value;
      const province = document.getElementById("signup-province").value;
      const contact = document.getElementById("signup-contact").value;

      if (password !== cpWord) {
        alert("Password and confirm password do not match.");
        return;
      }

      createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
          sendEmailVerification(auth.currentUser)
            .then(() => {
              alert("Verification email sent. Please check your inbox.");
            })
            .catch((error) => {
              console.error("Error sending verification email:", error);
            });

          auth
            .signOut()
            .then(() => {})
            .catch((error) => {
              console.error("Error signing out:", error);
            });

          const user = userCredential.user;
          const userData = {
            fName: fName,
            lName: lName,
            email: email,
            age: age,
            gender: gender,
            province: province,
            contact: contact,
            profileImg: "none",
          };
          set(ref(database, "users/" + user.uid), userData)
            .then(() => {
              alert("Registration successful!");
              window.location.reload();
            })
            .catch((error) => {
              alert("Error registering user: " + error.message);
            });
        })
        .catch((error) => {
          const errorMessage = error.message;
          alert(errorMessage);
        });
    }

    function resetPassword() {
      const email = document.getElementById("loginEmail").value;

      sendPasswordResetEmail(auth, email)
        .then(() => {
          alert("Password reset email sent. Please check your inbox.");
        })
        .catch((error) => {
          const errorMessage = error.message;
          alert(errorMessage);
        });
    }
  })
  .catch((error) => {
    console.error("Error setting persistence:", error);
  });
