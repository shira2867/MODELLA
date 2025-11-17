// app/home/page.tsx
"use client";
import MyCloset from "@/app/Components/MyCloset/MyCloset";
import NewLook from "@/app/Components/NewLook/NewLook";
import Footer from "../Components/Footer/Footer";
import BurgerMenu from '../Components/BurgerMenu/BurgerMenu';

import styles from "./mycloset.module.css";

export default function ShowMyCloset() {
  const userId = "123";

  return (
   <div className={styles.pageContainer}>
    <BurgerMenu />
      <div className={styles.mainArea}>
        <NewLook />
        <MyCloset userId={userId} />
      </div>
      <Footer />
    </div>
  );
}
