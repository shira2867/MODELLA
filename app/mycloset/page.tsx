// app/home/page.tsx
import MyCloset from "@/app/Components/MyCloset/MyCloset";
import NewLook from "@/app/Components/NewLook/NewLook";
import Header from "../Components/Header/Header";
import Footer from "../Components/Footer/Footer";

import styles from "./mycloset.module.css";

export default function ShowMyCloset() {
  const userId = "123";

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
