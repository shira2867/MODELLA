"use client";

import Image from "next/image";
import styles from "./Welcome.module.css";
import logo from "../../../public/logo.png";
import { useRouter, useSearchParams } from "next/navigation";

export default function Welcome() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectLookId = searchParams.get("redirectLookId");

  const handleRedirect = (path: string) => {
    if (redirectLookId) {
      localStorage.setItem("redirectLookId", redirectLookId);
      console.log("Saved redirectLookId:", redirectLookId);
    }
    router.replace(path);
  };

  return (
    <div className={styles.welcome}>
      <div className={styles.Container}>
        <Image
          className={styles.logo}
          src={logo}
          alt="Project Logo"
          width={400}
          height={200}
        />
        <h1 className={styles.title}>Dress. Style. Shine.</h1>
        <p className={styles.subtitle}>
          Discover your perfect look with Modella{" "}
        </p>
        <p className={styles.subtitle}>- where fashion meets technology!</p>
        <div className={styles.buttonContainer}>
          <button
            className={styles.button}
            onClick={() => handleRedirect("/register")}
          >
            Join Us
          </button>
          <button
            className={styles.button}
            onClick={() => handleRedirect("/login")}
          >
            Member Login
          </button>
        </div>
      </div>
    </div>
  );
}
