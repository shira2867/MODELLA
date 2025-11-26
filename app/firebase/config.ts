// import { initializeApp } from "firebase/app";
// import { getAuth, GoogleAuthProvider } from "firebase/auth";

// const firebaseConfig = {
//   apiKey: "AIzaSyDiO9v_BzyyJ8C0W_M_pNvGFHGOH0rcn0E",
//   authDomain: "modella-19e1a.firebaseapp.com",
//   projectId: "modella-19e1a",
// storageBucket: "modella-19e1a.firebasestorage.app",
//   messagingSenderId: "950370790683",
//   appId: "1:950370790683:web:c4b6c74355ac2bd7e077be",
// };

// const app = initializeApp(firebaseConfig);

// const auth = getAuth(app);
// const provider = new GoogleAuthProvider();

// export { auth, provider };

// app/firebase/config.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDiO9v_BzyyJ8C0W_M_pNvGFHGOH0rcn0E",
  authDomain: "modella-19e1a.firebaseapp.com",
  projectId: "modella-19e1a",
  storageBucket: "modella-19e1a.appspot.com", // 👈 נכון ואחיד בכל הפרויקט
  messagingSenderId: "950370790683",
  appId: "1:950370790683:web:c4b6c74355ac2bd7e077be",
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
