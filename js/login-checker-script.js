import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import {
  getAuth,
  signOut,
  setPersistence,
  browserSessionPersistence,
} from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js";
import {
  getDatabase,
  ref,
  get,
} from "https://www.gstatic.com/firebasejs/10.11.1/firebase-database.js";
import {
  getStorage,
  ref as storageRef,
  getDownloadURL,
} from "https://www.gstatic.com/firebasejs/10.11.1/firebase-storage.js";

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
const storage = getStorage(firebaseApp);

setPersistence(auth, browserSessionPersistence)
  .then(() => {
    const loginBtn = document.querySelector(".login-btn");
    const profileContainer = document.querySelector(".profile-container");
    const profileImg = document.querySelector(".profile-img");

    document.querySelector(".btn-logout").addEventListener("click", logout);

    auth.onAuthStateChanged((user) => {
      if (user) {
        const userRef = ref(database, "users/" + user.uid);
        get(userRef)
          .then((snapshot) => {
            if (snapshot.exists()) {
              const userData = snapshot.val();
              loginBtn.textContent = userData.fName;

              loginBtn.removeAttribute("href");
              loginBtn.style.pointerEvents = "none";

              if (userData.profileImg != "none") {
                const imageRef = storageRef(
                  storage,
                  `profileImg/${userData.email}/${userData.profileImg}`
                );

                getDownloadURL(imageRef)
                  .then((url) => {
                    profileImg.setAttribute("src", url);
                  })
                  .catch((error) => {
                    console.error("Error getting download URL:", error);
                  });
              }

              document
                .querySelector(".profile-container")
                .addEventListener("click", () => {
                  document
                    .querySelector(".profile-container")
                    .classList.toggle("active");
                });
            }
          })
          .catch((error) => {
            console.error("Error getting additional user information:", error);
          });
      } else {
        profileContainer.style.pointerEvents = "none";
      }
    });

    function logout() {
      signOut(auth)
        .then(() => {
          sessionStorage.clear();
          window.location.reload();
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
