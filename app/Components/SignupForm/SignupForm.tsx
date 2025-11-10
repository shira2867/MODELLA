"use client";
import Image from "next/image";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signOut,
  User,
} from "firebase/auth";

import styles from "./SignupForm.module.css";

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

export default function AuthForm() {
  const [user, setUser] = useState<User | null>(null);
  const { register, handleSubmit } = useForm<FormData>();
  const router = useRouter();

  async function signInWithGoogle() {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      setUser(user);

      await fetch("/api/user/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: user.displayName,
          email: user.email,
          profileImage: user.photoURL,
        }),
      });

      router.push("/complete-profile");
    } catch (error) {
      console.error(error);
    }
  }
  async function onSubmit(data: FormData) {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );
      const user = userCredential.user;
      setUser(user);

      await fetch("/api/user/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user.email,
          password: data.password,
          createdAt: new Date(),
        }),
      });

      router.push("/complete-profile");
    } catch (error: any) {
      // Firebase משתמש בקודים ספציפיים לטעויות
      if (error.code === "auth/email-already-in-use") {
        alert("The email is already registered. Please log in instead.");
      } else {
        console.error(error);
        alert(error.message || "Error creating account");
      }
    }
  }

  // async function onSubmit(data: FormData) {
  //   try {
  //     const userCredential = await createUserWithEmailAndPassword(
  //       auth,
  //       data.email,
  //       data.password
  //     );
  //     const user = userCredential.user;
  //     setUser(user);

  //     await fetch("/api/user/register", {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({
  //         email: user.email,
  //         password: data.password,
  //         createdAt: new Date(),
  //       }),
  //     });

  //     router.push("/complete-profile");
  //   } catch (error) {
  //     console.error(error);
  //   }
  // }

  function signOutUser() {
    signOut(auth)
      .then(() => setUser(null))
      .catch(console.error);
  }

  return (
    <div className={styles.container}>
      {!user ? (
        <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
          <h2>Create Your Account</h2>

          <button
            type="button"
            onClick={signInWithGoogle}
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

          <label className={styles.checkboxContainer}>
            <input type="checkbox" />
            Receive news, updates and deals
          </label>

          <button type="submit" className={styles.button}>
            Create Account
          </button>

          <p className={styles.terms}>
            By creating an account, you agree to the{" "}
            <a href="#">Terms of Service</a> and{" "}
            <a href="#">Privacy Policy</a>.
          </p>

          <p className={styles.loginLink}>
            Already have an account? <a href="#">Log in here</a>
          </p>
        </form>
      ) : (
        <div className={styles.userInfo}>
          <h2>Welcome, {user.displayName || user.email}</h2>
          {user.photoURL && (
            <Image
              src={user.photoURL}
              alt="Profile"
              width={100}
              height={100}
              className={styles.profileImage}
            />
          )}

        </div>
      )}
    </div>
  );
}
