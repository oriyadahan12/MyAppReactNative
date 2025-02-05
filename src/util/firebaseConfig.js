import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

// הגדר את המפתח שלך מפיירבייס
const firebaseConfig = {
    apiKey: "AIzaSyA2_07Bmdjc17g9o6Iay1xuqmqTp4E6Hy0",
    authDomain: "userautoapp.firebaseapp.com",
    projectId: "userautoapp",
    storageBucket: "userautoapp.firebasestorage.app",
    messagingSenderId: "710882524172",
    appId: "1:710882524172:web:6d4e6a3c6b678a90ae4229",
};

// אתחול הפיירבייס
const app = initializeApp(firebaseConfig);

// גישה לפונקציות Auth ו-Firestore
const db = getFirestore(app);

const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage),
  });

export { db, app, auth};
