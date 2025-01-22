import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';  // ייבוא Firebase Auth
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyA2_07Bmdjc17g9o6Iay1xuqmqTp4E6Hy0",
  authDomain: "userautoapp.firebaseapp.com",
  projectId: "userautoapp",
  storageBucket: "userautoapp.firebasestorage.app",
  messagingSenderId: "710882524172",
  appId: "1:710882524172:web:6d4e6a3c6b678a90ae4229",
  measurementId: "G-Z5E1H16BP6"
};

// אתחול האפליקציה
const app = initializeApp(firebaseConfig);

// ייצוא השירותים
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);


