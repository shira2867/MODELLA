"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import styles from "./MyCloset.module.css";

type ClothingItem = {
  _id: string;
  imageUrl: string;
  category: string;
  thickness: string;
  style: string;
  colorName: string;
};

type MyClosetProps = {
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

const CATEGORIES = [
  "All",
  "shirt",
  "pants",
  "Jacket&coat",
  "dress",
  "Skirts",
  "Shoes",
  "Accessories",
];

const MyCloset: React.FC<MyClosetProps> = ({ userId }) => {
  const [clothes, setClothes] = useState<ClothingItem[]>([]);
  const [loading, setLoading] = useState(true);

  // מסננים
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [colorFilter, setColorFilter] = useState<string | null>(null);

  // הצגת אפשרות סינון צבע
  const [showColorFilter, setShowColorFilter] = useState(false);

  useEffect(() => {
    const fetchClothes = async () => {
      try {
        const res = await axios.get(`/api/clothing?userId=${userId}`);
        setClothes(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchClothes();
  }, [userId]);

  // סינון לפי קטגוריה וצבע
  const filteredClothes = clothes.filter((item) => {
    if (categoryFilter && item.category !== categoryFilter) return false;
    if (colorFilter && item.colorName !== colorFilter) return false;
    return true;
  });

  return (
    <div className={styles.container}>
      <Header />

      <div className={styles.mainContent}>
        <h2 className={styles.title}>My Closet</h2>

        {/* סינון לפי קטגוריות */}
        <div className={styles.filterWrapper}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              className={`${styles.filterButton} ${
                (!categoryFilter && cat === "All") || categoryFilter === cat
                  ? styles.active
                  : ""
                // categoryFilter === cat ? styles.active : ""
              }`}
              onClick={() => setCategoryFilter(cat === "All" ? null : cat)}
            >
              {cat}
            </button>
          ))}

          {/* כפתור מסנן צבע בצד */}
          <button
            className={styles.filterButton}
            style={{ marginLeft: "auto" }}
            onClick={() => setShowColorFilter(!showColorFilter)}
          >
            🎨 Color Filter
          </button>
        </div>

        {/* אפשרות סינון צבעים */}
        {showColorFilter && (
          <div className={styles.colorFilterWrapper}>
            {Object.keys(COLOR_MAP).map((color) => (
              <div
                key={color}
                // className={styles.colorCircle}
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

        {/* תצוגת הכרטיסיות */}
        {loading ? (
          <p className={styles.loading}>Loading...</p>
        ) : filteredClothes.length === 0 ? (
          <p className={styles.noClothes}>No items found.</p>
        ) : (
          <div className={styles.cardsWrapper}>
            {filteredClothes.map((item) => (
              <div key={item._id} className={styles.card}>
                <img
                  src={item.imageUrl}
                  alt={item.category}
                  className={styles.clothImage}
                />
                <div className={styles.cardContent}>
                  <div
                    className={styles.colorPreview}
                    style={{
                      backgroundColor: COLOR_MAP[item.colorName]
                        ? `rgb(${COLOR_MAP[item.colorName].join(",")})`
                        : "#ffffff", // צבע ברירת מחדל אם לא מוגדר
                    }}
                    // style={{
                    //   backgroundColor: `rgb(${COLOR_MAP[item.colorName].join(
                    //     ","
                    //   )})`,
                    // }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default MyCloset;
