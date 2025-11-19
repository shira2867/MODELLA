"use client";
import React from "react";
import { useForm } from "react-hook-form";
import Image from "next/image";
import styles from "./CompleteProfile.module.css";
import { ProfileData } from "@/types/userTypes";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";

export default function CompleteProfile({ userEmail }: { userEmail: string }) {
  const router = useRouter();
  const { register, handleSubmit, reset } = useForm<ProfileData>();

  const updateProfileMutation = useMutation<any, any, ProfileData>({
    mutationFn: async (data: ProfileData) => {
      const res = await fetch("/api/user/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: userEmail,
          ...data,
        }),
      });
      return res.json();
    },
    onSuccess: (result) => {
      if (result.ok) {
        console.log("Profile updated successfully!");
        router.push("/login");
        reset();
      } else {
        alert(result.error || "Error updating profile");
      }
    },
    onError: (err: any) => {
      console.error(err);
      alert("Server error");
    },
  });


  const onSubmit = (data: ProfileData) => {
    updateProfileMutation.mutate(data);
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>Almost done! Just a few more details.</h1>

        <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
          <h2>Complete Your Profile</h2>

          <input {...register("name")} placeholder="Full name" required />
          <select {...register("gender")} required>
            <option value="">Select gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>

        <button
          type="submit"
          className={styles.button}
          disabled={updateProfileMutation.isPending} 
        >
          {updateProfileMutation.isPending ? "Saving..." : "Save"}
        </button>

      </form>
    </div>
  );
}
