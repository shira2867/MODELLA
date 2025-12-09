import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getStorage } from "firebase/storage";


const firebaseConfig = {
  apiKey: "AIzaSyDiO9v_BzyyJ8C0W_M_pNvGFHGOH0rcn0E",
  authDomain: "modella-19e1a.firebaseapp.com",
  projectId: "modella-19e1a",
  storageBucket: "modella-19e1a.appspot.com", 
  messagingSenderId: "950370790683",
  appId: "1:950370790683:web:c4b6c74355ac2bd7e077be",
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const firebaseApp = app;
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();




