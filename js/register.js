import { initializeApp } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-auth.js";
import { firebaseConfig } from "./firebase-config.js"; // Make sure this file exists and has your config

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Handle Registration
document.getElementById("registerForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("regEmail").value;
  const password = document.getElementById("regPassword").value;
  const status = document.getElementById("regStatus");

  try {
    await createUserWithEmailAndPassword(auth, email, password);
    window.location.href = "dashboard.html"; // Redirect on success
  } catch (error) {
    status.textContent = error.message;
    status.style.color = "red";
  }
});
