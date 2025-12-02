"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ShareLookType } from "@/types/shareLookType";
import styles from "./LookPopUp.module.css";
import { LikeButton, CommentForm } from "../LikeAndComment/LikeAndComment";
import { useUserStore } from "@/store/userStore";
import down from "../../../public/img/down.png";

type Props = {
  look: ShareLookType;
  onClose: () => void;
};

export default function LookPopup({ look, onClose }: Props) {
  const itemsArray = Array.isArray(look.items) ? look.items : [];
  const router = useRouter();

  const [comments, setComments] = useState<any[]>(
    Array.isArray(look.comments) ? look.comments : []
  );

  const [name, setName] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const user = useUserStore((state) => state.user);
  const userIdFromStore = useUserStore((state) => state.userId);

  useEffect(() => {
    if (user?.name) setName(user.name);
    if (userIdFromStore) setUserId(userIdFromStore);
    if (user?.profileImage) setProfileImage(user.profileImage);
  }, [user, userIdFromStore]);

  const handleShareAll = () => {
    if (!look._id) {
      alert("This look is not shared with everyone yet!");
      return;
    }
    router.push(`/sharelookall/${look._id}`);
  };
  const togglePanel = () => setIsOpen((prev) => !prev);

  return (
    <div className={styles.modalBackdrop} onClick={onClose} role="presentation">
      <div
        className={styles.modalContent}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Look preview"
      >
        <button
          className={styles.closeX}
          onClick={onClose}
          aria-label="Close look preview"
          type="button"
        >
          ✕
        </button>

        <h2 className={styles.modalTitle}>Look Preview</h2>

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

        <section className={styles.container}>
          <header className={styles.sectionHeader}>
            <p className={styles.eyebrow}>Closet remix</p>
            <h1 className={styles.title}>Do you want to create like this look?</h1>
            <p className={styles.description}>
              Replace inspiration pieces with items from your closet to build a personalised edit.
            </p>
          </header>

          <button
            type="button"
            className={`${styles.toggle} ${isOpen ? styles.toggleOpen : ""}`}
            onClick={handleShareAll}
            aria-expanded={isOpen}
            aria-controls="look-creator-panel"
          >
            <span>{isOpen ? "Hide look builder" : "Show look builder"}</span>
            <Image
              src={down}
              alt="Toggle look builder"
              className={`${styles.arrow} ${isOpen ? styles.open : ""}`}
            />
          </button>
        </section>

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
  <Image
    src={c.profileImage}
    alt={c.userName}
    width={40}
    height={40}
    className={styles.commentAvatar}
    onError={(e) => {
      const target = e.target as HTMLImageElement;
      target.src = "/default-avatar.png"; 
    }}
  />
) : (
  <div className={styles.commentAvatarFallback}>
    {c.userName?.charAt(0).toUpperCase() || "U"}
  </div>
)}


    <div className={styles.commentContent}>
      <div className={styles.commentHeader}>
        <span className={styles.commentUserName}>{c.userName}</span>
        <span className={styles.commentDate}>
          {c.createdAt ? new Date(c.createdAt).toLocaleString("he-IL") : ""}
        </span>
      </div>
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
