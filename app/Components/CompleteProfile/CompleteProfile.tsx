"use client";
import React from "react";
import { useForm } from "react-hook-form";
import styles from "./CompleteProfile.module.css";
import { useToast } from "../Toast/ToastProvider";
import { ProfileData } from "@/types/userTypes";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";

export default function CompleteProfile() {
  const router = useRouter();
  const { register, handleSubmit, reset } = useForm<ProfileData>();
  const { showToast } = useToast();

  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileData) => {
      const res = await fetch("/api/user/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      return res.json();
    },
    onSuccess: (result) => {
      if (result.ok) {
        showToast("Profile updated successfully!", "success");
        reset();
        router.push("/login");
      } else {
        showToast(result.error || "Error updating profile", "error");
      }
    },
    onError: () => {
      showToast("Server error", "error");
    },
  });

  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>Almost done!</h1>

      <form
        onSubmit={handleSubmit((data) => updateProfileMutation.mutate(data))}
        className={styles.form}
      >
        <input {...register("name", { required: true })} placeholder="Full name" />

        <select {...register("gender", { required: true })}>
          <option value="">Select gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
        </select>

        <button type="submit" disabled={updateProfileMutation.isPending}>
          {updateProfileMutation.isPending ? "Saving..." : "Save"}
        </button>
      </form>
    </div>
  );
}
