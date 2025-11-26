"use client";
import { useState } from "react";
import styles from "./ShareLookCard.module.css";
import { ShareLookType } from "@/types/shareLookType";
import LookModal from "../LookPupUp/LookPopUp";
import { LikeButton } from "../LikeAndComment/LikeAndComment";
import { useUserStore } from "@/store/userStore";

type Props = {
  look: ShareLookType;
};

export default function SharedLookCard({ look }: Props) {
  const [open, setOpen] = useState(false);
  const [likes, setLikes] = useState<string[]>(look.likes || []);

  const userId = useUserStore((state) => state.userId);

  const handleLike = (updatedLikes: string[]) => {
    setLikes(updatedLikes);
  };

  if (!userId) return <div>Loading...</div>;

  return (
    <div className={styles.container}>
      <div className={styles.card} onClick={() => setOpen(true)}>
        <div className={styles.grid}>
          {look.items?.map((item, index) => (
            <div key={item._id || index} className={styles.itemWrapper}>
              <img
                className={styles.image}
                src={item.imageUrl}
                alt={item.category || "item"}
              />
            </div>
          ))}
        </div>
        <div className={styles.info}>
          <LikeButton
            lookId={look._id}
            userId={userId}  // עכשיו תמיד מוגדר
            likes={likes}
            onLike={handleLike}
          />
        </div>
      </div>

      {open && <LookModal look={look} onClose={() => setOpen(false)} />}
    </div>
  );
}
