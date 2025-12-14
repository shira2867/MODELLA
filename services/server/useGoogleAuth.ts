"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "@/app/firebase/config";
import { useUserStore } from "@/store/userStore";
import { useToast } from "@/app/Components/Toast/ToastProvider";

export function useGoogleAuth() {
  const router = useRouter();
  const setUser = useUserStore((state) => state.setUser);
  const setUserId = useUserStore((state) => state.setUserId);
  const { showToast } = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signInWithGoogle = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // 1. Firebase popup
      const result = await signInWithPopup(auth, provider);
      const firebaseUser = result.user;

      if (!firebaseUser.email) {
        throw new Error("Google account has no email.");
      }

      const email = firebaseUser.email;

      // 2. Upsert ב־Mongo דרך /api/user/register
      const registerRes = await fetch("/api/user/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: firebaseUser.displayName ?? "",
          email,
          profileImage: firebaseUser.photoURL ?? "",
        }),
      });

      if (!registerRes.ok) {
        throw new Error("Failed to sync user with server.");
      }

      const registerData = await registerRes.json();
      const isExistingUser = !!registerData.exists; // true = User updated, false = User created

      // 3. להביא את המשתמש המלא (כולל id) דרך /api/user?email
      const userRes = await fetch(`/api/user?email=${encodeURIComponent(email)}`);
      if (!userRes.ok) {
        throw new Error("Failed to load user data.");
      }

      const userData = await userRes.json();
      const dbUser = userData.user;

      // 4. לשמור ב־Zustand
      setUser({
        name: dbUser?.name ?? firebaseUser.displayName ?? null,
        email: dbUser?.email ?? firebaseUser.email ?? null,
        profileImage: dbUser?.profileImage ?? firebaseUser.photoURL ?? null,
        gender: (dbUser?.gender as "male" | "female" | null) ?? null,
      });

      if (dbUser?.id) {
        setUserId(dbUser.id);
      }

      // 5. לשמור cookie מהשרת
      const idToken = await firebaseUser.getIdToken();
      const cookieRes = await fetch("/api/auth/set-cookie", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });

      if (!cookieRes.ok) {
        console.error("Failed to set auth cookie");
      }

      // 6. ניווט – קודם כל לבדוק redirectLookId
      const redirectLookId = localStorage.getItem("redirectLookId");

      if (redirectLookId) {
        localStorage.removeItem("redirectLookId");
        router.replace(`/sharelookpersonal/${redirectLookId}`);
      } else if (!isExistingUser) {
        // משתמש חדש → השלמת פרופיל
        router.push("/complete-profile");
      } else {
        // משתמש קיים → בית
        router.replace("/home");
      }

      showToast(
        isExistingUser ? "Welcome back!" : "Account created successfully",
        "success"
      );
    } catch (err: any) {
      console.error(err);
      const msg = err?.message || "Google login failed";
      setError(msg);
      showToast(msg, "error");
    } finally {
      setIsLoading(false);
    }
  };

  return { signInWithGoogle, isLoading, error };
}
