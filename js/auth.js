// auth.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.x.x/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.x.x/firebase-auth.js";

const firebaseConfig = {
  // your Firebase config
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const form = document.getElementById('loginForm');
const loginBtn = document.getElementById('loginBtn');

form.addEventListener('submit', (e) => {
  e.preventDefault();

  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const statusMsg = document.getElementById('status');

  loginBtn.disabled = true;
  statusMsg.textContent = "⏳ Logging in...";

  signInWithEmailAndPassword(auth, email, password)
    .then(() => {
      statusMsg.textContent = "✅ Login successful!";
      window.location.href = "dashboard.html";
    })
    .catch((error) => {
      statusMsg.textContent = `❌ Error: ${error.message}`;
      loginBtn.disabled = false;
    });
});
