"use client";
import Image from "next/image";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { initializeApp } from "firebase/app";
import { getAuth, signInWithPopup, GoogleAuthProvider, createUserWithEmailAndPassword, signOut, User } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDiO9v_BzyyJ8C0W_M_pNvGFHGOH0rcn0E",
  authDomain: "modella-19e1a.firebaseapp.com",
  projectId: "modella-19e1a",
  storageBucket: "modella-19e1a.firebasestorage.app",
  messagingSenderId: "950370790683",
  appId: "1:950370790683:web:c4b6c74355ac2bd7e077be"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

type FormData = {
  email: string;
  password: string;
};

export default function AuthForm() {
  const [user, setUser] = useState<User | null>(null);
  const { register, handleSubmit } = useForm<FormData>();

  // כניסה עם גוגל
  function signInWithGoogle() {
    signInWithPopup(auth, provider)
      .then(async (result) => {
        const user = result.user;
        setUser(user);

        // שמירה במסד MongoDB
        await fetch("/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: user.displayName,
            email: user.email,
            profileImage: user.photoURL,
            gender: "female", // אפשר לשנות בהתאם
          }),
        });

        console.log("Signed in as:", user.displayName);
      })
      .catch(console.error);
  }

  // יצירת משתמש עם אימייל וסיסמה
  async function onSubmit(data: FormData) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      const user = userCredential.user;
      setUser(user);

      // שמירה במסד MongoDB
      await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user.email,
          createdAt: new Date(),
        }),
      });

      console.log("User registered:", user.email);
    } catch (error) {
      console.error(error);
    }
  }

  function signOutUser() {
    signOut(auth).then(() => setUser(null)).catch(console.error);
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-50 dark:bg-black font-sans gap-4">
      {/* טופס רגיל */}
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-2 bg-white p-6 rounded shadow-md dark:bg-zinc-800">
        <input {...register("email")} placeholder="Email" className="p-2 border rounded" />
        <input {...register("password")} type="password" placeholder="Password" className="p-2 border rounded" />
        <button type="submit" className="bg-blue-500 text-white p-2 rounded mt-2">Register / Login</button>
      </form>

      {/* כניסה עם גוגל */}
      <button onClick={signInWithGoogle} className="rounded-full bg-white px-6 py-3 shadow-md hover:shadow-lg active:scale-95 dark:bg-zinc-800">
        Sign in with Google
      </button>

      {/* התנתקות */}
      {user && (
        <>
          <button onClick={signOutUser} className="rounded-full bg-white px-6 py-3 shadow-md dark:bg-zinc-800">
            Sign Out
          </button>

          <div className="mt-4 text-center">
            <h2 className="text-xl font-semibold text-zinc-800 dark:text-zinc-200">
              Welcome, {user.displayName || user.email}
            </h2>
            {user.photoURL && <Image src={user.photoURL} alt="Profile Picture" width={100} height={100} className="rounded-full mt-2" />}
          </div>
        </>
      )}
    </div>
  );
}
