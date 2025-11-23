"use client";

import { useQuery } from "@tanstack/react-query";
import SharedLookCard from "../Components/ShareLookCard/ShareLookCard";
import styles from "./styleFeedPage.module.css";
import { ShareLookType } from "@/types/shareLookType";

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

  if (isLoading) return <p>טוען...</p>;
  if (isError) return <p>אירעה שגיאה בטעינת הלוקים</p>;

  return (
    <div className={styles.grid}>
      {looks.map((look) => (
        <SharedLookCard key={look._id} look={look} />
      ))}
    </div>
  );
}
