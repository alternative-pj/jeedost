// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";
// import { getAnalytics } from "firebase/analytics"; // Uncomment if you want to use Analytics

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC7AFU3F1htxIKUXCz91RyA1uwrH_rIX4Y",
  authDomain: "chating-4432.firebaseapp.com",
  databaseURL: "https://chating-4432-default-rtdb.firebaseio.com",
  projectId: "chating-4432",
  storageBucket: "chating-4432.appspot.com",
  messagingSenderId: "319986242781",
  appId: "1:319986242781:web:c15ffbebb0efe977a93734",
  measurementId: "G-TRM2KHSBGP"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);
const storage = getStorage(app);
// const analytics = getAnalytics(app); // Uncomment if using Analytics
