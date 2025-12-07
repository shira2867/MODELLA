"use client";

import { useEffect, useState } from "react";
import { useUserStore } from "@/store/userStore";
import { ProfileData } from "@/types/userTypes";
import { auth } from "@/app/firebase/config";
import { sendPasswordResetEmail } from "firebase/auth";
import { uploadToCloudinary } from "@/services/server/cloudinary";
import { FaCamera } from "react-icons/fa";
import Header from "../../Components/Header/Header";
import Footer from "../../Components/Footer/Footer";
import styles from "./Profile.module.css";

export default function ProfilePage() {
  const { user, setUser } = useUserStore();
  const email = user?.email || null;

  const [form, setForm] = useState<ProfileData>({
    name: "",
    gender: "",
    profileImage: "",
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isSendingReset, setIsSendingReset] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    setForm({
      name: user.name || "",
      gender: user.gender || "",
      profileImage: user.profileImage || "",
    });
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setImageFile(file);
    setImagePreview(file ? URL.createObjectURL(file) : null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!email) return setError("Please log in first.");

    setIsSaving(true);
    try {
      let profileImageUrl = form.profileImage || user?.profileImage || null;

      if (imageFile) profileImageUrl = await uploadToCloudinary(imageFile);

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
      if (!res.ok) return setError(data?.error || "Failed to update profile.");

      const updatedUser = {
        name: form.name,
        email,
        profileImage: data?.profileImage || profileImageUrl || null,
        gender: (form.gender as "male" | "female") || null,
      };
      setUser(updatedUser);

      setForm(prev => ({ ...prev, profileImage: updatedUser.profileImage || "" }));
      setImageFile(null);
      setImagePreview(null);
      setSuccess("Profile updated successfully.");
    } catch (err) {
      console.error(err);
      setError("Something went wrong.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSendResetEmail = async () => {
    if (!email) return setError("Please log in first.");
    setIsSendingReset(true);
    setError(null);
    setSuccess(null);
    try {
      await sendPasswordResetEmail(auth, email);
      setSuccess("Password reset email sent.");
    } catch {
      setError("Failed to send reset email.");
    } finally {
      setIsSendingReset(false);
    }
  };

  if (!email) return <div className={styles.page}><Header /><main className={styles.main}><p>Please log in first.</p></main><Footer /></div>;

  const avatarLetter = (form.name || email || "U").charAt(0).toUpperCase();
  const avatarImage = imagePreview || form.profileImage || user?.profileImage || null;

  return (
    <div className={styles.page}>
      <Header />
      <main className={styles.main}>
        <form className={styles.card} onSubmit={handleSubmit}>
          <div className={styles.left}>
            <div className={styles.avatarContainer}>
              <label className={styles.avatar}>
                {avatarImage ? <img src={avatarImage} alt="Profile" /> : avatarLetter}
                <input type="file" accept="image/*" onChange={handleImageChange} />
              </label>
              <FaCamera className={styles.cameraIcon}/>

            </div>

            <div className={styles.avatarText}>
              <span className={styles.avatarName}>{form.name || "New user"}</span>
              <br />
              <span className={styles.avatarEmail}>{email}</span>
            </div>
            {(error || success) && (
              <div className={`${styles.message} ${error ? styles.error : styles.success}`}>
                {error || success}
              </div>
            )}
          </div>

          <div className={styles.right}>
            <div className={styles.field}>
              <label className={styles.label}>Name</label>
              <input name="name" value={form.name} onChange={handleChange} className={styles.input} />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Gender</label>
              <select name="gender" value={form.gender} onChange={handleChange} className={styles.select}>
                <option value="">Select</option>
                <option value="female">Female</option>
                <option value="male">Male</option>
              </select>
            </div>
            <div className={styles.actionsRow}>
              <button type="submit" className={styles.primaryButton} disabled={isSaving}>
                {isSaving ? "Saving..." : "Save changes"}
              </button>
            </div>
            <div className={styles.passwordBlock}>
              <div className={styles.sectionTitle}>Password</div>
              <p className={styles.passwordText}>Send a reset link to your email to change your password.</p>
              <button type="button" onClick={handleSendResetEmail} disabled={isSendingReset} className={styles.secondaryButton}>
                {isSendingReset ? "Sending..." : "Send password reset email"}
              </button>
            </div>
          </div>
        </form>
      </main>
      <Footer />
    </div>
  );
}
