"use client";

import { useQuery } from "@tanstack/react-query";
import SharedLookCard from "../../Components/ShareLookCard/ShareLookCard";
import styles from "./styleFeedPage.module.css";
import { ShareLookType } from "@/types/shareLookType";
import Header from "../../Components/Header/Header";
import Footer from "../../Components/Footer/Footer";

export default function StyleFeedPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["shared-looks"],
    queryFn: async () => {
      const res = await fetch("/api/sharelook");
      if (!res.ok) throw new Error("Failed to fetch shared looks");
      return res.json();
    },
  });

  const looks: ShareLookType[] = data || [];

  if (isLoading) return <p>...</p>;
  if (isError) return <p>אירעה שגיאה בטעינת הלוקים</p>;

  return (
    <div className={styles.pageContainer}>
     <Header></Header>
    <h1 className={styles.title}>style feed</h1>
    <div className={styles.grid}>
  {looks.map((look) => (
    <div key={look._id} className={styles.card}>
      <SharedLookCard look={look} />
    </div>
  ))}
</div>

     <Footer></Footer>
    </div>
  );
}
