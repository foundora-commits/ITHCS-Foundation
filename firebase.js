import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-analytics.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCqSAmA5np3imH45WVYCwyauWiy0tziqAY",
  authDomain: "ithcs-foundation-website.firebaseapp.com",
  projectId: "ithcs-foundation-website",
  storageBucket: "ithcs-foundation-website.firebasestorage.app",
  messagingSenderId: "110557119137",
  appId: "1:110557119137:web:0795824e073cde4657e6e0",
  measurementId: "G-7R2FDQBVDG"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);

export { db, collection, addDoc, serverTimestamp };