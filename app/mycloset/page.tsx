// app/home/page.tsx
"use client";
import MyCloset from "@/app/Components/MyCloset/MyCloset";
import NewLook from "@/app/Components/NewLook/NewLook";
import Footer from "../Components/Footer/Footer";
import BurgerMenu from '../Components/BurgerMenu/BurgerMenu';
import { useEffect, useState } from "react";
import styles from "./mycloset.module.css";
import Header from "../Components/Header/Header";

export default function ShowMyCloset() {
  
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
    <Header />
      <div className={styles.mainArea}>
        <NewLook />
        <MyCloset userId={userId} />
      </div>
      <Footer />
    </div>
  );
}
