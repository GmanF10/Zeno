import { initializeApp } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-auth.js";

// Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCHkSQPSm6la7b9E8O_Tc3YMI-FWWQzt4g",
  authDomain: "zeno-14a48.firebaseapp.com",
  projectId: "zeno-14a48",
  storageBucket: "zeno-14a48.appspot.com",
  messagingSenderId: "416659613054",
  appId: "1:416659613054:web:default-app-id-placeholder"  // Make sure to replace this with the actual app ID if necessary
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
