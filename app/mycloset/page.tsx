"use client";
import MyCloset from "@/app/Components/MyCloset/MyCloset";
import NewLook from "@/app/Components/NewLook/NewLook";
import Footer from "../Components/Footer/Footer";
import Header from "../Components/Header/Header";
import MobileNewLookBanner from "@/app/Components/MobileNewLookBanner/MobileNewLookBanner";
import { useEffect, useState } from "react";
import styles from "./mycloset.module.css";

type LookCreationMode = "default" | "inspiration";

export default function ShowMyCloset() {
  const [userId, setUserId] = useState<string | null>(null);
  const [inspirationColors, setInspirationColors] = useState<string[]>([]);
  const [lookMode, setLookMode] = useState<LookCreationMode>("default");
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");
    setUserId(storedUserId);

    const checkMobile = () => setIsMobile(window.innerWidth <= 960);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleModeChange = (mode: LookCreationMode) => {
    setLookMode(mode);
    if (mode === "default") setInspirationColors([]);
  };

  if (!userId) return <div>Loading...</div>;

  return (
    <div className={styles.pageContainer}>
      <Header /> <div className={styles.pageTitleWrapper}></div>{" "}
      {isMobile && (
        <MobileNewLookBanner
          setInspirationColors={setInspirationColors}
          lookMode={lookMode}
          onModeChange={handleModeChange}
        />
      )}{" "}
      <div className={styles.mainArea}>
        {" "}
        {!isMobile && (
          <NewLook
            setInspirationColors={setInspirationColors}
            lookMode={lookMode}
            onModeChange={handleModeChange}
          />
        )}{" "}
        <MyCloset userId={userId} inspirationColors={inspirationColors} />{" "}
      </div>
      <Footer />{" "}
    </div>
  );
}
