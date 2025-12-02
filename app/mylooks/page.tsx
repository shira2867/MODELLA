"use client";
import { useEffect, useState } from "react";
import MyLooks from "@/app/Components/MyLooks/MyLooks";
import Headers from "../Components/Header/Header";
import Footer from "../Components/Footer/Footer";
import styles from "./ShowMyLooks.module.css"; // ניצור CSS קטן

export default function ShowMyLooks() {
  const [userId, setUserId] = useState<string | null>(null);
  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");
    setUserId(storedUserId);
  }, []);

  if (!userId) {
    return <div>Loading...</div>;
  }

  return (
    <div className={styles.pageContainer}>
      <Headers />
      <div className={styles.mainContent}>
        <MyLooks userId={userId} />
      </div>
      <Footer />
    </div>
  );
}
