"use client";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  User,
} from "firebase/auth";
import { useUserStore } from "@/store/userStore";

import styles from "./Login.module.css";

const firebaseConfig = {
  apiKey: "AIzaSyDiO9v_BzyyJ8C0W_M_pNvGFHGOH0rcn0E",
  authDomain: "modella-19e1a.firebaseapp.com",
  projectId: "modella-19e1a",
  storageBucket: "modella-19e1a.appspot.com",
  messagingSenderId: "950370790683",
  appId: "1:950370790683:web:c4b6c74355ac2bd7e077be",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

type FormData = {
  email: string;
  password: string;
};

export default function LoginForm() {
  const { register, handleSubmit } = useForm<FormData>();
  const router = useRouter();
  const setUserStore = useUserStore((state) => state.setUser);
  const [errorMessage, setErrorMessage] = useState("");

  async function loginWithGoogle() {
    try {
      const result = await signInWithPopup(auth, provider);
      const firebaseUser = result.user;

      const res = await fetch(`/api/user?email=${firebaseUser.email}`);
      const data = await res.json();

      if (!data.exists) {
        alert("User not found. Please register first.");
        router.push("/signup");
        return;
      }

      setUserStore({
        name: firebaseUser.displayName || null,
        email: firebaseUser.email || null,
        profileImage: firebaseUser.photoURL || null,
        gender: data.user?.gender || null,
      });

      router.push("/home"); 
    } catch (err) {
      console.error(err);
      setErrorMessage("Google login failed.");
    }
  }

  async function onSubmit(data: FormData) {
    try {
      const res = await fetch(`/api/user?email=${data.email}`);
      const dbData = await res.json();

      if (!dbData.exists) {
        setErrorMessage("User not found. Please register first.");
        return;
      }

      const userCredential = await signInWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );
      const firebaseUser = userCredential.user;

      setUserStore({
        name: dbData.user?.name || "",
        email: firebaseUser.email || null,
        profileImage: dbData.user?.profileImage || "",
        gender: dbData.user?.gender || null,
      });

      router.push("/home");
    } catch (err: any) {
      console.error(err);
      if (err.code === "auth/wrong-password") {
        setErrorMessage("Incorrect password.");
      } else {
        setErrorMessage("Login failed.");
      }
    }
  }

  return (
    <div className={styles.loginPage}>
  <div className={styles.localHeader}>
    <Image src="/logo.png" alt="Project Logo" width={210} height={210} />
  </div>

  <div className={styles.container}>
      <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
        <h2>Login</h2>

        <button
          type="button"
          onClick={loginWithGoogle}
          className={styles.googleButton}
        >
          <Image src="/google.png" alt="Google" width={18} height={18} />
          Continue with Google
        </button>

        <div className={styles.orDivider}>Or</div>

        <input
          {...register("email")}
          placeholder="Email address"
          className={styles.input}
        />
        <input
          {...register("password")}
          type="password"
          placeholder="Password"
          className={styles.input}
        />

        {errorMessage && <p className={styles.error}>{errorMessage}</p>}

        <button type="submit" className={styles.button}>
          Login
        </button>

        <p className={styles.signupLink}>
          Don't have an account? <a href="/register">Sign up here</a>
        </p>
      </form>
    </div>
</div>
  );
}
