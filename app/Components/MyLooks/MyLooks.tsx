"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import styles from "./MyLooks.module.css";

type LookCard = {
  _id: string;
  imageUrl: string;   // תמונת הקאבר של הלוק
  style: string;      // casual / formal / sporty / party
  colorName: string;  // צבע דומיננטי של הלוק (לפי הפריט הראשון)
};

type MyLooksProps = {
  userId: string;
};

// מפת צבעים מוגדרת מראש
const COLOR_MAP: Record<string, [number, number, number]> = {
  Red: [255, 0, 0],
  Pink: [255, 192, 203],
  Orange: [255, 165, 0],
  Yellow: [255, 255, 0],
  Green: [0, 128, 0],
  Blue: [0, 0, 255],
  Purple: [128, 0, 128],
  Brown: [165, 42, 42],
  Gray: [128, 128, 128],
  Black: [0, 0, 0],
  White: [255, 255, 255],
  Beige: [245, 245, 220],
};

const styleOptions = ["All", "casual", "formal", "sporty", "party"];

const MyLooks: React.FC<MyLooksProps> = ({ userId }) => {
  const [looks, setLooks] = useState<LookCard[]>([]);
  const [loading, setLoading] = useState(true);

  // מסננים
  const [styleFilter, setStyleFilter] = useState<string | null>(null);
  const [colorFilter, setColorFilter] = useState<string | null>(null);
  const [showColorFilter, setShowColorFilter] = useState(false);

  useEffect(() => {
    const fetchLooks = async () => {
      try {
        const res = await axios.get(`/api/looks?userId=${userId}`);
        setLooks(res.data);
      } catch (err) {
        console.error("Failed to fetch looks", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLooks();
  }, [userId]);

  const filteredLooks = looks.filter((look) => {
    if (styleFilter && look.style !== styleFilter) return false;
    if (colorFilter && look.colorName !== colorFilter) return false;
    return true;
  });

  return (
    <div className={styles.container}>
      <Header />

      <div className={styles.mainContent}>
        <h2 className={styles.title}>My Looks</h2>

        {/* כפתורי סינון לפי סטייל */}
        <div className={styles.filterWrapper}>
          {styleOptions.map((opt) => (
            <button
              key={opt}
              className={`${styles.filterButton} ${
                (!styleFilter && opt === "All") || styleFilter === opt
                  ? styles.active
                  : ""
              }`}
              onClick={() => setStyleFilter(opt === "All" ? null : opt)}
            >
              {opt}
            </button>
          ))}

          {/* כפתור לפתיחת סינון צבע */}
          <button
            className={styles.filterButton}
            style={{ marginLeft: "auto" }}
            onClick={() => setShowColorFilter(!showColorFilter)}
          >
            🎨 Color Filter
          </button>
        </div>

        {/* פאנל בחירת צבע */}
        {showColorFilter && (
          <div className={styles.colorFilterWrapper}>
            {Object.keys(COLOR_MAP).map((color) => (
              <div
                key={color}
                className={`${styles.colorCircle} ${
                  colorFilter === color ? styles.activeColor : ""
                }`}
                style={{
                  backgroundColor: `rgb(${COLOR_MAP[color].join(",")})`,
                }}
                onClick={() =>
                  setColorFilter(colorFilter === color ? null : color)
                }
                title={color}
              />
            ))}
          </div>
        )}

        {/* תוכן ראשי */}
        {loading ? (
          <p className={styles.loading}>Loading...</p>
        ) : filteredLooks.length === 0 ? (
          <p className={styles.noClothes}>No looks found.</p>
        ) : (
          <div className={styles.cardsWrapper}>
            {filteredLooks.map((look) => (
              <Link
                key={look._id}
                href={`/mylooks/${look._id}`} // ⬅ לחיצה על כרטיס → עמוד לוק
                className={styles.card}
              >
                <img
                  src={look.imageUrl}
                  alt={look.style}
                  className={styles.clothImage}
                />
                <div className={styles.cardContent}>
                  <div
                    className={styles.colorPreview}
                    style={{
                      backgroundColor: COLOR_MAP[look.colorName]
                        ? `rgb(${COLOR_MAP[look.colorName].join(",")})`
                        : "#ffffff",
                    }}
                  />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default MyLooks;
