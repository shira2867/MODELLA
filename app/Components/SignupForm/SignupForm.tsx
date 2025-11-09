"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import styles from "./SignupForm.module.css";
import { FcGoogle } from "react-icons/fc";
import axios from "axios";

export default function SignupForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [subscribe, setSubscribe] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post("/api/auth/register", { email, password, subscribe });
      alert("Account created successfully!");
    } catch (error: any) {
      alert(error.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Create Your Account</h2>

      <button
        onClick={() => signIn("google")}
        className={styles.googleButton}
        disabled={loading}
      >
        <FcGoogle className={styles.googleIcon} /> Continue with Google
      </button>

      <div className={styles.divider}>
        <span>Or</span>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.inputGroup}>
          <label>Email address</label>
          <input
            type="email"
            placeholder="email@address.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className={styles.inputGroup}>
          <label>Password</label>
          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <label className={styles.checkbox}>
          <input
            type="checkbox"
            checked={subscribe}
            onChange={(e) => setSubscribe(e.target.checked)}
          />
          Receive news, updates and deals
        </label>

        <button type="submit" className={styles.submitButton} disabled={loading}>
          {loading ? "Creating..." : "Create Account"}
        </button>
      </form>

      <p className={styles.terms}>
        By creating an account, you agree to the{" "}
        <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.
      </p>

      <p className={styles.loginText}>
        Already have an account? <a href="/login">Log in here</a>
      </p>
    </div>
  );
}