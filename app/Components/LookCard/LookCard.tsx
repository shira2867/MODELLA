"use client";
import React, { useState } from "react";
import styles from "./LookCard.module.css";
import { FiShare2, FiMail, FiMessageCircle } from "react-icons/fi";
import { FaFacebookF } from "react-icons/fa";
import { ClothingItem } from "@/types/clothTypes";

type LookCardProps = {
  items: ClothingItem[];
  lookId?: string;
};

const LookCard: React.FC<LookCardProps> = ({ items, lookId }) => {
  const [open, setOpen] = useState(false);

  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
  const lookUrl = `${BASE_URL}/look/${lookId}`;

  const handleClick = () => setOpen(true);

  const openPopup = (url: string) => {
    window.open(url, "_blank", "width=600,height=500,noopener,noreferrer");
  };

  const shareCopyLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(lookUrl);
    alert("Link copied!");
  };

  const shareEmail = (e: React.MouseEvent) => {
    e.stopPropagation();
    openPopup(`mailto:?subject=Check out this look&body=${lookUrl}`);
  };

  const shareWhatsApp = (e: React.MouseEvent) => {
    e.stopPropagation();
    openPopup(`https://wa.me/?text=${encodeURIComponent(lookUrl)}`);
  };

  const shareFacebook = (e: React.MouseEvent) => {
    e.stopPropagation();
    openPopup(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
        lookUrl
      )}`
    );
  };

  return (
    <>
      {/* הכרטיס */}
      <div
        className={styles.card}
        onClick={handleClick}
        style={{ cursor: "pointer" }}
      >
        <div className={styles.grid}>
          {items.map((item) => (
            <div key={item._id} className={styles.itemWrapper}>
              <img
                src={item.imageUrl}
                alt={item.category}
                className={styles.image}
              />
            </div>
          ))}
        </div>

        <div className={styles.shareButtons}>
          <button className={styles.shareButton} onClick={shareCopyLink}>
            <FiShare2 size={18} />
          </button>
          <button className={styles.shareButton} onClick={shareEmail}>
            <FiMail size={18} />
          </button>
          <button className={styles.shareButton} onClick={shareWhatsApp}>
            <FiMessageCircle size={18} />
          </button>
          <button className={styles.shareButton} onClick={shareFacebook}>
            <FaFacebookF size={18} />
          </button>
        </div>
      </div>

      {/* פופ-אפ */}
      {open && (
        <div
          className={styles.modalBackdrop}
          onClick={() => setOpen(false)}
        >
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            {/* איקס סגירה */}
            <div className={styles.closeX} onClick={() => setOpen(false)}>
              ✕
            </div>

            <h2 className={styles.modalTitle}>Look Preview</h2>

            <div className={styles.modalGrid}>
              {items.map((item) => (
                <div key={item._id}>
                  <img
                    src={item.imageUrl}
                    alt={item.category}
                    className={styles.modalImage}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default LookCard;
