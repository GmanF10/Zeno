import { initializeApp } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-auth.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCHkSQPSm6la7b9E8O_Tc3YMI-FWWQzt4g",
  authDomain: "zeno-14a48.firebaseapp.com",
  projectId: "zeno-14a48",
  storageBucket: "zeno-14a48.appspot.com",
  messagingSenderId: "416659613054",
  appId: "1:416659613054:web:37e45bf1cc7b9bb9c77f2f"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// DOM Elements
const loginForm = document.getElementById("loginForm");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const statusEl = document.getElementById("status");

// Set status message with color based on error or success
const setStatus = (msg, isError = false) => {
  statusEl.textContent = msg;
  statusEl.style.color = isError ? "#ff7777" : "#00ff99";
};

// Handle login form submission
const handleLogin = async (event) => {
  event.preventDefault();

  const email = emailInput.value.trim();
  const password = passwordInput.value;

  if (!email || !password) {
    setStatus("⚠️ Please enter email and password.", true);
    return;
  }

  try {
    await signInWithEmailAndPassword(auth, email, password);
    window.location.href = "dashboard.html"; // Redirect on success
  } catch (error) {
    setStatus(`❌ Login failed: ${error.message}`, true);
  }
};

// Attach submit event listener if form exists
if (loginForm) {
  loginForm.addEventListener("submit", handleLogin);
}

// Redirect to login if user is not logged in and trying to access protected pages
onAuthStateChanged(auth, (user) => {
  const onLoginPage = window.location.pathname.includes("login.html") || window.location.pathname === "/";
  if (!user && !onLoginPage) {
    window.location.href = "login.html";
  }
});
