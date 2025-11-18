"use client";
import React from "react";
import styles from "./LookCard.module.css";
import { FiShare2, FiMail, FiMessageCircle } from "react-icons/fi";
import { FaFacebookF, FaTwitter } from "react-icons/fa";

type ClothingItem = {
  _id: string;
  imageUrl: string;
  category: string;
  colorName?: string;
  style?: string;
};

type LookCardProps = {
  items: ClothingItem[];
  lookId?: string;
};

const LookCard: React.FC<LookCardProps> = ({ items, lookId }) => {
  const lookUrl = `${window.location.origin}/look/${lookId || ""}`;

  const shareCopyLink = () => {
    navigator.clipboard.writeText(lookUrl);
    alert("Link copied!");
  };

  const shareEmail = () => {
    window.open(`mailto:?subject=Check out this look&body=${lookUrl}`);
  };

  const shareWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(lookUrl)}`, "_blank");
  };

  const shareFacebook = () => {
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(lookUrl)}`,
      "_blank"
    );
  };

  const shareTwitter = () => {
    window.open(
      `https://twitter.com/intent/tweet?url=${encodeURIComponent(lookUrl)}&text=Check out this look!`,
      "_blank"
    );
  };

  return (
    <div className={styles.card}>
      <div className={styles.grid}>
        {items.map((item) => (
          <div key={item._id} className={styles.itemWrapper}>
            <img src={item.imageUrl} alt={item.category} className={styles.image} />
          </div>
        ))}
      </div>

      <div className={styles.shareButtons}>
        <button className={`${styles.shareButton} ${styles.copy}`} onClick={shareCopyLink}>
          <FiShare2 size={18} /> 
        </button>
        <button className={`${styles.shareButton} ${styles.email}`} onClick={shareEmail}>
          <FiMail size={18} /> 
        </button>
        <button className={`${styles.shareButton} ${styles.whatsapp}`} onClick={shareWhatsApp}>
          <FiMessageCircle size={18} /> 
        </button>
        <button className={`${styles.shareButton} ${styles.facebook}`} onClick={shareFacebook}>
          <FaFacebookF size={18} /> 
        </button>
        <button className={`${styles.shareButton} ${styles.twitter}`} onClick={shareTwitter}>
          <FaTwitter size={18} /> 
        </button>
      </div>
    </div>
  );
};

export default LookCard;
