"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import SharedLookCard from "../../Components/ShareLookCard/ShareLookCard";
import styles from "./styleFeedPage.module.css";
import { ShareLookType } from "@/types/shareLookType";
import Header from "../../Components/Header/Header";
import Footer from "../../Components/Footer/Footer";

function Loader() {
  return (
    <div className={styles.loaderContainer}>
      <div className={styles.dashedSpinner}></div>
    </div>
  );
}

export default function StyleFeedPage() {
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const userData = localStorage.getItem("user-storage");
    if (!userData) return;

    try {
      const parsed = JSON.parse(userData);
      setUserId(parsed?.state?.userId ?? null);
    } catch (err) {
      console.error("Error parsing user-storage", err);
    }
  }, []);

  const { data, isLoading, isError } = useQuery<ShareLookType[]>({
    queryKey: ["shared-looks", userId],
    queryFn: async () => {
      const url = userId ? `/api/sharelook?userId=${userId}` : `/api/sharelook`;

      const res = await fetch(url);
      if (!res.ok) {
        throw new Error("Failed to fetch shared looks");
      }
      return res.json();
    },
  });

  const looks = data ?? [];

  return (
    <div className={styles.pageContainer}>
      <Header />

      <main className={styles.mainContent}>
        {isLoading && <Loader />}

        {isError && (
          <p className={styles.error}>An error occurred while loading looks</p>
        )}

        {!isLoading && !isError && looks.length === 0 && (
          <p className={styles.empty}>No shared looks available yet</p>
        )}

        {!isLoading && !isError && looks.length > 0 && (
          <div className={styles.grid}>
            {looks.map((look) => (
              <div key={look._id} className={styles.card}>
                <SharedLookCard look={look} />
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
