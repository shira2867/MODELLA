// firebase/config.ts
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// הגדרות הפרויקט שלך מפאנל Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDiO9v_BzyyJ8C0W_M_pNvGFHGOH0rcn0E",
  authDomain: "modella-19e1a.firebaseapp.com",
  projectId: "modella-19e1a",
  storageBucket: "modella-19e1a.appspot.com",
  messagingSenderId: "950370790683",
  appId: "1:950370790683:web:c4b6c74355ac2bd7e077be",
};

// אתחול האפליקציה
const app = initializeApp(firebaseConfig);

// יצירת אובייקט auth ואובייקט ספק (Google)
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// מייצאים כדי שיהיה אפשר להשתמש בהם בקבצים אחרים
export { auth, provider };
