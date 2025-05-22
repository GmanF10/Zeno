// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/11.8.1/firebase-auth.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCHkSQPSm6la7b9E8O_Tc3YMI-FWWQzt4g",
  authDomain: "zeno-14a48.firebaseapp.com",
  projectId: "zeno-14a48",
  storageBucket: "zeno-14a48.appspot.com",
  messagingSenderId: "416659613054",
  appId: "1:416659613054:web:37e45bf1cc7b9bb9c77f2f",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// DOM Elements
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const rememberMeCheckbox = document.getElementById("rememberMe");
const loginBtn = document.getElementById("loginBtn");
const statusEl = document.getElementById("status");
const forgotPasswordLink = document.getElementById("forgotPassword");
const forgotEmailLink = document.getElementById("forgotEmail");

// Error messages
const firebaseErrorMessages = {
  "auth/invalid-email": "❌ Invalid email format.",
  "auth/user-disabled": "❌ This account has been disabled.",
  "auth/user-not-found": "❌ No user found with this email.",
  "auth/wrong-password": "❌ Incorrect password.",
};

// Utility function to display status
function setStatus(message, isError = false) {
  statusEl.textContent = message;
  statusEl.style.color = isError ? "#ff4d4d" : "#4caf50";
}

// Save/clear remembered email
function saveRememberedEmail(email) {
  if (rememberMeCheckbox.checked) {
    localStorage.setItem("rememberedEmail", email);
  } else {
    localStorage.removeItem("rememberedEmail");
  }
}

// Load remembered email on load
window.addEventListener("DOMContentLoaded", () => {
  const rememberedEmail = localStorage.getItem("rememberedEmail");
  if (rememberedEmail) {
    emailInput.value = rememberedEmail;
    rememberMeCheckbox.checked = true;
  }
});

// Login function
async function loginUser() {
  const email = emailInput.value.trim();
  const password = passwordInput.value;

  if (!email || !password) {
    setStatus("⚠️ Please enter both email and password.", true);
    return;
  }

  try {
    await signInWithEmailAndPassword(auth, email, password);
    setStatus(`✅ Welcome, ${email}`);
    saveRememberedEmail(email);
    // Redirect to dashboard
    setTimeout(() => {
      window.location.href = "dashboard.html";
    }, 1000);
  } catch (error) {
    const msg = firebaseErrorMessages[error.code] || "❌ Login failed. Please try again.";
    setStatus(msg, true);
  }
}

// Event Listeners
loginBtn.addEventListener("click", loginUser);

document.addEventListener("keydown", (e) => {
  if (e.key === "Enter") loginUser();
});

forgotPasswordLink.addEventListener("click", async (e) => {
  e.preventDefault();
  const email = emailInput.value.trim();

  if (!email) {
    setStatus("⚠️ Enter your email to reset password.", true);
    return;
  }

  try {
    await sendPasswordResetEmail(auth, email);
    setStatus(`✅ Password reset email sent to ${email}.`);
  } catch (error) {
    const msg = firebaseErrorMessages[error.code] || "❌ Unable to send reset email.";
    setStatus(msg, true);
  }
});

forgotEmailLink.addEventListener("click", (e) => {
  e.preventDefault();
  alert(
    "📩 Forgot your email?\n\nTry checking your inboxes or contact Zeno support for help recovering your account."
  );
});

// Auth state check
onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log("User logged in:", user.email);
  } else {
    console.log("No user is logged in.");
  }
});
