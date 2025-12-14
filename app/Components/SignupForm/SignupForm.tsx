"use client";

import Image from "next/image";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import logo from "../../../public/logo.png";
import Link from "next/link";
import { FormData } from "@/types/userTypes";
import {
  createUserWithEmailAndPassword,
  signOut,
  User,
} from "firebase/auth";
import { auth } from "@/app/firebase/config";
import { useToast } from "../Toast/ToastProvider";
import { useUserStore } from "@/store/userStore";
import { useMutation } from "@tanstack/react-query";
import styles from "./SignupForm.module.css";
import { useGoogleAuth } from "@/services/server/useGoogleAuth";

export default function AuthForm() {
  const [user, setUser] = useState<User | null>(null);
  const { register, handleSubmit } = useForm<FormData>();
  const router = useRouter();
  const setUserStore = useUserStore((state) => state.setUser);
  const { showToast } = useToast();

  // Shared Google auth hook
  const { signInWithGoogle, isLoading: isGoogleLoading } = useGoogleAuth();

  /**
   * Email/password registration mutation (DB side).
   * Google registration is handled by useGoogleAuth instead.
   */
  const registerUserMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await fetch("/api/user/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      return res.json();
    },
    onSuccess: (data, variables) => {
      // Store user in Zustand
      setUserStore({
        name: variables.name || "",
        email: variables.email || null,
        profileImage: variables.profileImage ?? null,
        gender: null,
      });

      // Redirect depending on backend response
      if (data.message === "User updated") {
        showToast("You need to login", "info");
        router.push("/login");
      } else {
        router.push("/complete-profile");
      }
    },
    onError: (error: any) => {
      showToast(error.message || "Error creating account", "error");
    },
  });

  /**
   * Email/password signup flow:
   *  - Create Firebase user
   *  - Create DB user via /api/user/register
   */
  async function onSubmit(data: FormData) {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );
      const firebaseUser = userCredential.user;
      setUser(firebaseUser);

      registerUserMutation.mutate({
        email: firebaseUser.email,
        password: data.password,
        createdAt: new Date(),
      });
    } catch (error: any) {
      if (error.code === "auth/email-already-in-use") {
        showToast(
          "The email is already registered. Please log in instead.",
          "error"
        );
      } else {
        console.error(error);
        showToast(error.message || "Error creating account", "error");
      }
    }
  }

  /**
   * Optional logout helper (not used directly in the signup form UI).
   */
  function signOutUser() {
    signOut(auth)
      .then(() => {
        setUser(null);
        useUserStore.getState().clearUser();
        showToast("Logged out successfully", "success");
      })
      .catch((err) => {
        console.error(err);
        showToast("Logout failed", "error");
      });
  }

  return (
    <div className={styles.signupPage}>
      <div className={styles.localHeader}>
        <Link href="/">
          <Image src={logo} alt="Project Logo" width={210} height={210} />
        </Link>
      </div>
      <div className={styles.container}>
        {!user ? (
          <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
            <h2>Create Your Account</h2>

            {/* Google signup/login using shared hook */}
            <button
              type="button"
              onClick={signInWithGoogle}
              className={styles.googleButton}
              disabled={isGoogleLoading}
            >
              {isGoogleLoading ? (
                "Continue..."
              ) : (
                <>
                  <Image src="/google.png" alt="Google" width={18} height={18} />
                  Continue with Google
                </>
              )}
            </button>

            <div className={styles.orDivider}>Or</div>

            {/* Email/password registration */}
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
              Already have an account? <a href="/login">Log in here</a>
            </p>
          </form>
        ) : (
          <div className={styles.userInfo}></div>
        )}
      </div>
    </div>
  );
}
