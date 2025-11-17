// app/Components/LookCard/LookCard.tsx
"use client";
import React from "react";
import styles from "./LookCard.module.css";
import { FiShare2 } from "react-icons/fi"; // אייקון שיתוף

type ClothingItem = {
  _id: string;
  imageUrl: string;
  category: string;
  colorName?: string;
  style?: string;
};

type LookCardProps = {
  items: ClothingItem[];
  lookId?: string; // מזהה ייחודי ל-look, אם יש
};

const LookCard: React.FC<LookCardProps> = ({ items, lookId }) => {

  return (
    <div className={styles.card}>
           <button className={styles.shareButton}>
        <FiShare2 size={30} />
      </button>
      <div className={styles.grid}>
        {items.map((item) => (
          <div key={item._id} className={styles.itemWrapper}>
            <img src={item.imageUrl} alt={item.category} className={styles.image} />
          </div>
        ))}
      </div>

   
    </div>
  );
};

export default LookCard;
