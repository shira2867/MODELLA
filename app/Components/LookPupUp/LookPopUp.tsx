"use client";

import { ShareLookType } from "@/types/shareLookType";
import styles from "./LookPopUp.module.css";

type Props = {
  look: ShareLookType;
  onClose: () => void;
};

export default function LookPopup({ look, onClose }: Props) {
  return (
    <div className={styles.modalBackdrop} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        {/* איקס סגירה */}
        <div className={styles.closeX} onClick={onClose}>
          ✕
        </div>

        <h2 className={styles.modalTitle}>Look Preview</h2>

        {/* Grid של פריטי הלוק */}
        <div className={styles.modalGrid}>
          {look.items.map((item) => (
            <div key={item._id} className={styles.modalItem}>
              <img
                src={item.imageUrl || "/placeholder.png"}
                alt={item.category || "item"}
                className={styles.modalImage}
              />
            </div>
          ))}
        </div>

        {/* תגובות */}
        <div className={styles.commentsSection}>
          <h3>תגובות</h3>

          {look.comment.length === 0 ? (
            <p className={styles.noComments}>אין תגובות עדיין</p>
          ) : (
            look.comment.map((c, i) => (
              <div key={i} className={styles.comment}>
                <strong>{c.userId}</strong>: {c.comment}
              </div>
            ))
          )}

          {/* טופס הוספת תגובה */}
          <form className={styles.commentForm}>
            <input
              type="text"
              placeholder="כתוב תגובה..."
              className={styles.commentInput}
            />
            <button type="submit" className={styles.commentBtn}>
              שלח
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
