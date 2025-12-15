"use client";

import Image from "next/image";
import Link from "next/link";
import React from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/app/firebase/config";
import { useUserStore } from "@/store/userStore";
import { useToast } from "../Toast/ToastProvider";
import { useMutation } from "@tanstack/react-query";
import { FormData } from "@/types/userTypes";
import { useGoogleAuth } from "@/services/server/useGoogleAuth";
import styles from "./SignupForm.module.css";

export default function SignupForm() {
  const { register, handleSubmit } = useForm<FormData>();
  const router = useRouter();
  const setUserStore = useUserStore((state) => state.setUser);
  const { showToast } = useToast();

  const { signInWithGoogle, isLoading: isGoogleLoading } = useGoogleAuth();

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
      setUserStore({
        name: variables.name || "",
        email: variables.email || null,
        profileImage: variables.profileImage ?? null,
        gender: null,
      });

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

  const onSubmit = async (data: FormData) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      const firebaseUser = userCredential.user;

      registerUserMutation.mutate({
        email: firebaseUser.email,
        password: data.password,
        createdAt: new Date(),
      });
    } catch (error: any) {
      if (error.code === "auth/email-already-in-use") {
        showToast("The email is already registered. Please log in instead.", "error");
      } else {
        showToast(error.message || "Error creating account", "error");
      }
    }
  };

  return (
    <div className={styles.signupPage}>
      <div className={styles.localHeader}>
        <Link href="/">
          <Image src="/logo.png" alt="Logo" width={210} height={210} />
        </Link>
      </div>

      <div className={styles.container}>
        <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
          <h2>Create Your Account</h2>

          <button type="button" onClick={signInWithGoogle} className={styles.googleButton} disabled={isGoogleLoading}>
            {isGoogleLoading ? "Continue..." : <> <Image src="/google.png" alt="Google" width={18} height={18} /> Continue with Google </>}
          </button>

          <div className={styles.orDivider}>Or</div>

          <input {...register("email")} placeholder="Email address" className={styles.input} />
          <input {...register("password")} type="password" placeholder="Password" className={styles.input} />

          <button type="submit" className={styles.button}>Create Account</button>

          <p className={styles.loginLink}>
            Already have an account? <Link href="/login">Log in here</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
