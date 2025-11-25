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
  const itemsArray = Array.isArray(look.items) ? look.items : [];

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
      <div
        className={styles.modalContent}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.closeX} onClick={onClose}>
          ✕
        </div>

        <h2 className={styles.modalTitle}>Look Preview</h2>

        {/* Items grid */}
        <div className={styles.modalGrid}>
          {itemsArray.map((item) => (
            <div key={item._id} className={styles.modalItem}>
              <img
                src={item.imageUrl || "/placeholder.png"}
                alt={item.category || "item"}
                className={styles.modalImage}
              />
            </div>
          ))}
        </div>

        {/* Comments section */}
        <div className={styles.commentsSection}>
          <CommentForm
            lookId={look._id}
            userId={userId || ""}
            userName={name || "Guest"}
            profileImage={profileImage || undefined}
            onNewComment={(newComments) =>
              setComments(Array.isArray(newComments) ? newComments : [])
            }
          />

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

                <div className={styles.commentContent}>
                  <div className={styles.commentHeader}>{c.userName}</div>
                  <p className={styles.commentText}>{c.text}</p>
                </div>
              </div>
            ))
          ) : (
            <p className={styles.noComments}>No comments yet</p>
          )}
        </div>
      </div>
    </div>
  );
}
