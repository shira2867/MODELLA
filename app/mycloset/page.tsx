"use client";
import MyCloset from "@/app/Components/MyCloset/MyCloset";
import NewLook from "@/app/Components/NewLook/NewLook";
import Footer from "../Components/Footer/Footer";
import { useEffect, useState } from "react";
import styles from "./mycloset.module.css";
import Header from "../Components/Header/Header";
import BurgerMenu from "../Components/BurgerMenu/BurgerMenu";

type LookCreationMode = "default" | "inspiration";

type LookCreationMode = "default" | "inspiration";

export default function ShowMyCloset() {
  const [userId, setUserId] = useState<string | null>(null);
  const [inspirationColors, setInspirationColors] = useState<string[]>([]);
  const [lookMode, setLookMode] = useState<LookCreationMode>("default");

  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");
    setUserId(storedUserId);
  }, []);

  const handleModeChange = (mode: LookCreationMode) => {
    setLookMode(mode);
    if (mode === "default") {
      setInspirationColors([]);
    }
  };

  if (!userId) {
    return <div>Loading...</div>;
  }

  return (
    <div className={styles.pageContainer}>
      <Header />
      <div className={styles.pageTitleWrapper}>
      </div>
      <div className={styles.mainArea}>
        <NewLook
          setInspirationColors={setInspirationColors}
          lookMode={lookMode}
          onModeChange={handleModeChange}
        />
        <MyCloset userId={userId} inspirationColors={inspirationColors} />
      </div>
      <Footer />
    </div>
  );
}
