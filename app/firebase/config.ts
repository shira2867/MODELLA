import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getStorage } from "firebase/storage";


const firebaseConfig = {
  apiKey: "AIzaSyDd-wijhmx4SfTghSNeQlsiAe5banRJ7Jk",
  authDomain: "modella-7c7bf.firebaseapp.com",
  projectId: "modella-7c7bf",
  storageBucket: "modella-7c7bf.firebasestorage.app",
  messagingSenderId: "499262282060",
  appId: "1:499262282060:web:1887db6445c9f93a2dd7e9",
};


const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const firebaseApp = app;
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();




