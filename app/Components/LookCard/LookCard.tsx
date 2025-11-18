"use client";
import React from "react";
import styles from "./LookCard.module.css";
import { FiShare2, FiMail, FiMessageCircle } from "react-icons/fi";
import { FaFacebookF } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { ClothingItem } from "@/types/clothTypes";

type LookCardProps = {
  items: ClothingItem[];
  lookId?: string;
};

const LookCard: React.FC<LookCardProps> = ({ items, lookId }) => {
  const router = useRouter();
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL
  const lookUrl = `${BASE_URL}/look/${lookId}`;
  console.log("lookId", lookId)
  const handleClick = () => {
    if (lookId) router.push(`/look/${lookId}`);
  };

  const shareCopyLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(lookUrl);
    alert("Link copied!");
  };

  const shareEmail = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(`mailto:?subject=Check out this look&body=${lookUrl}`);
  };

  const shareWhatsApp = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(`https://wa.me/?text=${encodeURIComponent(lookUrl)}`, "_blank");
  };

  const shareFacebook = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(lookUrl)}`,
      "_blank"
    );
  };

  return (
    <div className={styles.card} onClick={handleClick} style={{ cursor: "pointer" }}>
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
      </div>
    </div>
  );
};

export default LookCard;
