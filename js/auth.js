import { initializeApp } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/11.8.1/firebase-auth.js";

// Firebase config and initialization
const firebaseConfig = {
  apiKey: "AIzaSyCHkSQPSm6la7b9E8O_Tc3YMI-FWWQzt4g",
  authDomain: "zeno-14a48.firebaseapp.com",
  projectId: "zeno-14a48",
  storageBucket: "zeno-14a48.appspot.com",
  messagingSenderId: "416659613054",
  appId: "1:416659613054:web:37e45bf1cc7b9bb9c77f2f",
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Elements
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const loginBtn = document.getElementById("loginBtn");
const statusEl = document.getElementById("status");

// Friendly error messages
const firebaseErrorMessages = {
  "auth/invalid-email": "❌ The email address is not valid.",
  "auth/user-disabled": "❌ This user account has been disabled.",
  "auth/user-not-found": "❌ No user found with this email.",
  "auth/wrong-password": "❌ Incorrect password.",
};

// Update status message
function setStatus(message, isError = false) {
  statusEl.textContent = message;
  statusEl.style.color = isError ? "#ff4d4d" : "#4caf50";
}

// Login handler
async function loginUser() {
  const email = emailInput.value.trim();
  const password = passwordInput.value;

  if (!email || !password) {
    setStatus("⚠️ Please enter email and password.", true);
    return;
  }

  try {
    await signInWithEmailAndPassword(auth, email, password);
    setStatus(`✅ Logged in as ${email}`);
    // Redirect to dashboard or main app page
    setTimeout(() => {
      window.location.href = "dashboard.html";
    }, 1000);
  } catch (error) {
    const msg = firebaseErrorMessages[error.code] || "❌ Login failed. Please check your credentials.";
    setStatus(msg, true);
  }
}

// Event listeners
loginBtn.addEventListener("click", loginUser);

document.addEventListener("keydown", (e) => {
  if (e.key === "Enter") loginUser();
});

// Monitor auth state changes
onAuthStateChanged(auth, (user) => {
  if (user) {
    setStatus(`✅ Logged in as ${user.email}`);
  } else {
    setStatus("🔒 Not logged in.");
  }
});
