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

export default function ShareLookCard({ look }: Props) {
  const [open, setOpen] = useState(false);
  const [likes, setLikes] = useState<string[]>(look.likes || []);
  const userId = useUserStore((state) => state.userId);
  const profileImage = useUserStore((state) => state.user?.profileImage);

  const handleLike = (updatedLikes: string[]) => {
    setLikes(updatedLikes);
  };

  if (!userId) return <div>Loading...</div>;

  // Show up to 4 items inside the card (2x2 grid)
  const previewItems = Array.isArray(look.items)
    ? look.items.slice(0, 4)
    : [];

  return (
    <div className={styles.container}>
      <div className={styles.card} onClick={() => setOpen(true)}>
        <div className={styles.cardHeader}>
          

          <div className={styles.cardSummary}>
            <h3 className={styles.cardTitle}>{look.items?.length} curated items</h3>
            <p className={styles.cardHelper}>Tap any piece for a full-screen preview.</p>
          </div>
        </div>

        <div className={styles.cardBody}>
          <div className={styles.grid}>
            {look.items?.map((item) => (
              <div key={item._id} className={styles.itemWrapper}>
                <img className={styles.image} src={item.imageUrl} alt={item.category || "item"} />
              </div>
            ))}
          </div>
        </div>

        <div className={styles.cardFooter}>
          <LikeButton lookId={look._id} userId={userId} likes={likes} onLike={handleLike} />
        </div>
         <div className={styles.profileImage}>
          <img src={look.profileImage} alt="profileImage" />
        </div>
      </div>

      {open && <LookModal look={look} onClose={() => setOpen(false)} />}
    </div>
  );
}
