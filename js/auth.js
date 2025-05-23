// auth.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.x.x/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.x.x/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyCHkSQPSm6la7b9E8O_Tc3YMI-FWWQzt4g",
  authDomain: "zeno-14a48.firebaseapp.com",
  projectId: "zeno-14a48",
  storageBucket: "zeno-14a48.appspot.com",
  messagingSenderId: "416659613054",
  appId: "1:416659613054:web:default-app-id-placeholder"
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
      console.error("Login failed:", error.code, error.message);
      statusMsg.textContent = `❌ Error: ${error.message}`;
          loginBtn.disabled = false;
            
        });
    });
    