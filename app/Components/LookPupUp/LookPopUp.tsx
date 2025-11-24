"use client";

import { useState, useEffect } from "react";
import { ShareLookType } from "@/types/shareLookType";
import styles from "./LookPopUp.module.css";
import { LikeButton, CommentForm } from "../LikeAndComment/LikeAndComment";
import { useUserStore } from "@/store/userStore";

type Props = {
  look: ShareLookType;
  onClose: () => void;
};

export default function LookPopup({ look, onClose }: Props) {
  const [comments, setComments] = useState<any[]>(
    Array.isArray(look.comments) ? look.comments : []
  );
  const [name, setName] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [profileImage, setProfileImage] = useState<string | null>(null);

  const user = useUserStore((state) => state.user);
  const userIdFromStore = useUserStore((state) => state.userId);

  useEffect(() => {
    if (user?.name) setName(user.name);
    if (userIdFromStore) setUserId(userIdFromStore);
    if (user?.profileImage) setProfileImage(user.profileImage);
  }, [user, userIdFromStore]);

  return (
    <div className={styles.modalBackdrop} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.closeX} onClick={onClose}>
          ✕
        </div>

        <h2 className={styles.modalTitle}>Look Preview</h2>

        <div className={styles.modalGrid}>
          {Array.isArray(look.items) &&
            look.items.map((item) => (
              <div key={item._id} className={styles.modalItem}>
                <img
                  src={item.imageUrl || "/placeholder.png"}
                  alt={item.category || "item"}
                  className={styles.modalImage}
                />
              </div>
            ))}
        </div>

       

        <div className={styles.commentsSection}>
          <h3>תגובות</h3>

          {Array.isArray(comments) && comments.length > 0 ? (
            comments.map((c: any, i: number) => (
              <div key={i} className={styles.comment}>
                {c.profileImage ? (
                  <img
                    src={c.profileImage}
                    alt={c.userName}
                    className={styles.profileImage}
                  />
                ) : (
                  <div className={styles.userAvatar}>
                    {c.userName?.charAt(0).toUpperCase() || "U"}
                  </div>
                )}
                <strong>{c.userName}</strong>: {c.text}
              </div>
            ))
          ) : (
            <p className={styles.noComments}>אין תגובות עדיין</p>
          )}

          <CommentForm
            lookId={look._id}
            userId={userId || ""}
            userName={name || "Guest"}
            onNewComment={(newComments) =>
              setComments(Array.isArray(newComments) ? newComments : [])
            }
          />
        </div>
      </div>
    </div>
  );
}
