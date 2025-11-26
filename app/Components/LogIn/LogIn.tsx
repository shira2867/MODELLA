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
import { useMutation } from "@tanstack/react-query";
import styles from "./Login.module.css";
import { FormData } from "../../../types/userTypes";

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

export default function LoginForm() {
  const { register, handleSubmit } = useForm<FormData>();
  const router = useRouter();
  const setUser = useUserStore((state) => state.setUser);
  const setUserId = useUserStore((state) => state.setUserId);
  const [errorMessage, setErrorMessage] = useState("");

  const loginMutation = useMutation<
    { firebaseUser: User; dbData: any },
    any,
    FormData & { method: "google" | "email" }
  >({
    mutationFn: async (data) => {
      if (data.method === "google") {
        const result = await signInWithPopup(auth, provider);
        const firebaseUser = result.user;

        const res = await fetch(`/api/user?email=${firebaseUser.email}`);
        const dbData = await res.json();

        if (!dbData.exists)
          throw new Error("User not found. Please register first.");

        return { firebaseUser, dbData };
      } else {
        const res = await fetch(`/api/user?email=${data.email}`);
        const dbData = await res.json();
        if (!dbData.exists)
          throw new Error("User not found. Please register first.");

        const userCredential = await signInWithEmailAndPassword(
          auth,
          data.email!,
          data.password!
        );

        return { firebaseUser: userCredential.user, dbData };
      }
    },

    onSuccess: async ({ firebaseUser, dbData }) => {
      const idToken = await firebaseUser.getIdToken();

      const cookieRes = await fetch("/api/auth/set-cookie", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ idToken }),
      });
      if (!cookieRes.ok) {
        throw new Error("Failed to set authentication cookie.");
      }

      const redirectLookId = localStorage.getItem("redirectLookId");
      if (redirectLookId) {
        localStorage.removeItem("redirectLookId");
        router.replace(`/sharelookpersonal/${redirectLookId}`);
      } else {
        router.replace("/home");
      }
    },
    onError: (err: any) => {
      console.error(err);
      setErrorMessage(err.message || "Login failed");
    },
  });

  const handleGoogleLogin = () => {
    setErrorMessage("");
    loginMutation.mutate({ method: "google", email: "", password: "" });
  };

  const handleEmailLogin = (data: FormData) => {
    setErrorMessage("");
    loginMutation.mutate({ ...data, method: "email" });
  };

  return (
    <div className={styles.loginPage}>
      <div className={styles.localHeader}>
        <Image src="/logo.png" alt="Project Logo" width={210} height={210} />
      </div>

      <div className={styles.container}>
        <form onSubmit={handleSubmit(handleEmailLogin)} className={styles.form}>
          <h2>Login</h2>

          <button
            type="button"
            onClick={handleGoogleLogin}
            className={styles.googleButton}
            disabled={loginMutation.isPending}
          >
            {loginMutation.isPending &&
            loginMutation.variables?.method === "google" ? (
              "Logging in..."
            ) : (
              <>
                <Image src="/google.png" alt="Google" width={18} height={18} />
                Continue with Google
              </>
            )}
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

          <button
            type="submit"
            className={styles.button}
            disabled={
              loginMutation.isPending &&
              loginMutation.variables?.method === "email"
            }
          >
            {loginMutation.isPending &&
            loginMutation.variables?.method === "email"
              ? "Logging in..."
              : "Login"}
          </button>

          <p className={styles.signupLink}>
            Don't have an account? <a href="/register">Sign up here</a>
          </p>
        </form>
      </div>
    </div>
  );
}
