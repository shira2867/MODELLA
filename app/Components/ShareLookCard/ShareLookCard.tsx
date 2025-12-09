"use client";

import { useState } from "react";
import Image from "next/image";
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

  const handleLike = (updatedLikes: string[]) => {
    setLikes(updatedLikes);
  };

  if (!userId) return <div>Loading...</div>;

  return (
    <div className={styles.container}>
      <div className={styles.card} onClick={() => setOpen(true)}>
        <div className={styles.cardHeader}>
          <div className={styles.cardSummary}>
            <h3 className={styles.cardTitle}>
              {look.items?.length} curated items
            </h3>
            <p className={styles.cardHelper}>
              Tap any piece for a full-screen preview.
            </p>
          </div>
        </div>

        <div className={styles.cardBody}>
          <div className={styles.grid}>
            {look.items?.map((item) => (
              <div key={item._id} className={styles.itemWrapper}>
                <img
                  className={styles.image}
                  src={item.imageUrl}
                  alt={item.category || "item"}
                />
              </div>
            ))}
          </div>
        </div>

        <div className={styles.cardFooter}>
          <LikeButton
            lookId={look._id}
            userId={userId}
            likes={likes}
            onLike={handleLike}
          />
        </div>

        <div className={styles.profileImage}>
          {look.profileImage && (
            <Image
              src={look.profileImage}
              alt="Profile"
              width={40}
              height={40}
              className={styles.userImage}
            />
          )}
        </div>
      </div>

      {open && <LookModal look={look} onClose={() => setOpen(false)} />}
    </div>
  );
}
