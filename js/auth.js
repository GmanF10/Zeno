import { initializeApp } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-auth.js";

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

const loginBtn = document.getElementById("loginBtn");
const statusEl = document.getElementById("status");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");

loginBtn.addEventListener("click", async () => {
  const email = emailInput.value.trim();
  const password = passwordInput.value;

  if (!email || !password) {
    statusEl.textContent = "⚠️ Please enter email and password.";
    return;
  }

  loginBtn.disabled = true;
  statusEl.textContent = "⏳ Logging in...";

  try {
    await signInWithEmailAndPassword(auth, email, password);
    statusEl.textContent = `✅ Logged in as ${email}`;
    // Optionally redirect here
    // window.location.href = "dashboard.html";
  } catch (error) {
    statusEl.textContent = `❌ Login failed: ${error.message}`;
  } finally {
    loginBtn.disabled = false;
  }
});

// Clear status when user types in email or password inputs
emailInput.addEventListener("input", () => {
  statusEl.textContent = "";
});
passwordInput.addEventListener("input", () => {
  statusEl.textContent = "";
});

onAuthStateChanged(auth, user => {
  if (user) {
    statusEl.textContent = `✅ Logged in as ${user.email}`;
  } else {
    statusEl.textContent = "🔒 Not logged in.";
  }
});
