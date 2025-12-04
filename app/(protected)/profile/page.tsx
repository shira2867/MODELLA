"use client";

import { useEffect, useState } from "react";
import { useUserStore } from "@/store/userStore";
import { ProfileData } from "@/types/userTypes";
import { auth } from "@/app/firebase/config";
import { sendPasswordResetEmail } from "firebase/auth";

import Header from "../../Components/Header/Header";
import Footer from "../../Components/Footer/Footer";
import styles from "./Profile.module.css";

import { uploadToCloudinary } from "@/services/server/cloudinary"; // 👈 Added Cloudinary upload

export default function ProfilePage() {
  const { user, setUser, userId } = useUserStore();
  const email = user?.email || null;

  const [form, setForm] = useState<ProfileData>({
    name: "",
    gender: "",
    profileImage: "",
  });

  // Selected image file + preview
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [isSaving, setIsSaving] = useState(false);
  const [isSendingReset, setIsSendingReset] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Populate the form from the user in the store
  useEffect(() => {
    if (!user) return;
    setForm({
      name: user.name || "",
      gender: user.gender || "",
      profileImage: user.profileImage || "",
    });
    setImagePreview(user.profileImage || null);
  }, [user]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setImageFile(file);

    if (file) {
      const url = URL.createObjectURL(file);
      setImagePreview(url);
    } else {
      setImagePreview(form.profileImage || null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!email) {
      setError("Please log in first.");
      return;
    }

    setIsSaving(true);
    try {
      // 1) If a file was selected – upload it to Cloudinary
      let profileImageUrl =
        form.profileImage || user?.profileImage || null;

      if (imageFile) {
        profileImageUrl = await uploadToCloudinary(imageFile);
      }

      // 2) Send update request to the API (MongoDB)
      const res = await fetch("/api/user/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          name: form.name,
          gender: form.gender,
          profileImage: profileImageUrl,
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        setError(data?.error || "Failed to update profile.");
        return;
      }

      const finalProfileImage =
        data?.profileImage || profileImageUrl || null;

      const updatedUser = {
        name: form.name,
        email,
        profileImage: finalProfileImage,
        gender: (form.gender as "male" | "female") || null,
      };

      setUser(updatedUser);

      // Sync with Zustand localStorage (user-storage)
      try {
        const raw = localStorage.getItem("user-storage");
        if (raw) {
          const parsed = JSON.parse(raw);
          const next = {
            ...parsed,
            state: {
              ...(parsed.state || {}),
              user: {
                ...(parsed.state?.user || {}),
                ...updatedUser,
              },
            },
          };
          localStorage.setItem("user-storage", JSON.stringify(next));
        }
      } catch (e) {
        console.error("Failed to patch user-storage:", e);
      }

      setForm((prev) => ({
        ...prev,
        profileImage: finalProfileImage || "",
      }));
      setImagePreview(finalProfileImage);

      setSuccess("Profile updated successfully.");
    } catch (err) {
      console.error(err);
      setError("Something went wrong.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSendResetEmail = async () => {
    setError(null);
    setSuccess(null);

    if (!email) {
      setError("Please log in first.");
      return;
    }

    setIsSendingReset(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setSuccess("Password reset email sent. Check your inbox.");
    } catch (err) {
      console.error(err);
      setError("Failed to send reset email.");
    } finally {
      setIsSendingReset(false);
    }
  };

  if (!email) {
    return (
      <div className={styles.page}>
        <Header />
        <main className={styles.main}>
          <p>Please log in first.</p>
        </main>
        <Footer />
      </div>
    );
  }

  const avatarLetter = (form.name || email || "U").charAt(0).toUpperCase();
  const avatarImage =
    imagePreview || form.profileImage || user?.profileImage || null;

  return (
    <div className={styles.page}>
      <Header />

      <main className={styles.main}>
        <section className={styles.card}>
          {/* Left side – title + avatar */}
          <div className={styles.left}>
            <h1 className={styles.title}>My Profile</h1>
            <p className={styles.subtitle}>
              Update your personal details, profile image and preferences, so
              your looks and comments will always feel like you.
            </p>

            <div className={styles.avatarWrapper}>
              <div className={styles.avatar}>
                {avatarImage ? (
                  <img src={avatarImage} alt="Profile" />
                ) : (
                  avatarLetter
                )}
              </div>
              <div className={styles.avatarText}>
                <span className={styles.avatarName}>
                  {form.name || "New user"}
                </span>
                <span className={styles.avatarEmail}>{email}</span>
              </div>
            </div>

            {(error || success) && (
              <div
                className={`${styles.message} ${
                  error ? styles.error : styles.success
                }`}
              >
                {error || success}
              </div>
            )}
          </div>

          {/* Right side – form */}
          <div className={styles.right}>
            <div className={styles.sectionTitle}>Profile details</div>

            <form onSubmit={handleSubmit} className={styles.form}>
              {/* Upload image from computer */}
              <div className={styles.field}>
                <label className={styles.label}>Profile image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className={styles.input}
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Name</label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className={styles.input}
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Gender</label>
                <select
                  name="gender"
                  value={form.gender}
                  onChange={handleChange}
                  className={styles.select}
                >
                  <option value="">Select</option>
                  <option value="female">Female</option>
                  <option value="male">Male</option>
                </select>
              </div>

              <div className={styles.actionsRow}>
                <button
                  type="submit"
                  className={styles.primaryButton}
                  disabled={isSaving}
                >
                  {isSaving ? "Saving..." : "Save changes"}
                </button>
              </div>

              <div className={styles.passwordBlock}>
                <div className={styles.sectionTitle}>Password</div>
                <p className={styles.passwordText}>
                  To change your password, we&apos;ll send a reset link to your
                  email.
                </p>
                <button
                  type="button"
                  onClick={handleSendResetEmail}
                  disabled={isSendingReset}
                  className={styles.secondaryButton}
                >
                  {isSendingReset ? "Sending..." : "Send password reset email"}
                </button>
              </div>
            </form>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
