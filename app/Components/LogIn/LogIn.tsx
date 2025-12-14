"use client";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  User,
} from "firebase/auth";
import { useUserStore } from "@/store/userStore";
import { useMutation } from "@tanstack/react-query";
import styles from "./Login.module.css";
import { FormData } from "../../../types/userTypes";
import { auth, provider } from "@/app/firebase/config";

export default function LoginForm() {
  const { register, handleSubmit, getValues } = useForm<FormData>();
  const router = useRouter();
  const setUser = useUserStore((state) => state.setUser);
  const setUserId = useUserStore((state) => state.setUserId);

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSendingReset, setIsSendingReset] = useState(false);

  const loginMutation = useMutation<
    { firebaseUser: User; dbUser: any },
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

        const dbUser = dbData.user;
        return { firebaseUser, dbUser };
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

        const dbUser = dbData.user;
        return { firebaseUser: userCredential.user, dbUser };
      }
    },

    onSuccess: async ({ firebaseUser, dbUser }) => {
      setUser({
        name: dbUser?.name ?? null,
        email: firebaseUser.email ?? null,
        profileImage: dbUser?.profileImage ?? firebaseUser.photoURL ?? null,
        gender: (dbUser?.gender as "male" | "female" | null) ?? null,
      });

      if (dbUser?.id) {
        setUserId(dbUser.id);
      }

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
    setSuccessMessage("");
    loginMutation.mutate({ method: "google", email: "", password: "" });
  };

  const handleEmailLogin = (data: FormData) => {
    setErrorMessage("");
    setSuccessMessage("");
    loginMutation.mutate({ ...data, method: "email" });
  };

  const handleForgotPassword = async () => {
    setErrorMessage("");
    setSuccessMessage("");

    const email = getValues("email");

    if (!email) {
      setErrorMessage("Please enter your email first.");
      return;
    }

    try {
      setIsSendingReset(true);
      await sendPasswordResetEmail(auth, email);
      setSuccessMessage("Password reset email sent. Check your inbox.");
    } catch (err) {
      console.error(err);
      setErrorMessage("Failed to send reset email.");
    } finally {
      setIsSendingReset(false);
    }
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

          <button
            type="button"
            onClick={handleForgotPassword}
            className={styles.forgotPasswordButton}
            disabled={isSendingReset}
          >
            {isSendingReset ? "Sending reset link..." : "Forgot your password?"}
          </button>

          {errorMessage && <p className={styles.error}>{errorMessage}</p>}
          {successMessage && <p className={styles.success}>{successMessage}</p>}

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
