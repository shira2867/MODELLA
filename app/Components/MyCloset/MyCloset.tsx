

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

// צבעים
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

const STYLES = ["casual", "sporty", "formal"];
const SEASONS = ["Spring", "Summer", "Autumn", "Winter"];

const MyCloset: React.FC<MyClosetProps> = ({ userId }) => {
  const [clothes, setClothes] = useState<ClothingItem[]>([]);
  const [loading, setLoading] = useState(true);

  // מסננים
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [colorFilter, setColorFilter] = useState<string | null>(null);
  const [styleFilter, setStyleFilter] = useState<string | null>(null);
  const [seasonFilter, setSeasonFilter] = useState<string | null>(null);

  const [showFilterSidebar, setShowFilterSidebar] = useState(false);
  const [activeFilterSection, setActiveFilterSection] = useState<
    "color" | "style" | "season" | null
  >(null);

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

  const filteredClothes = clothes.filter((item) => {
    if (categoryFilter && categoryFilter !== "All" && item.category !== categoryFilter)
      return false;
    if (colorFilter && item.colorName !== colorFilter) return false;
    if (styleFilter && item.style !== styleFilter) return false;
    if (seasonFilter && item.thickness) {
      const thicknessSeasonMap: Record<string, string[]> = {
        light: ["Summer", "Spring"],
        medium: ["Autumn", "Spring"],
        heavy: ["Winter"],
      };
      const seasonsForItem = thicknessSeasonMap[item.thickness] || [];
      if (!seasonsForItem.includes(seasonFilter)) return false;
    }
    return true;
  });

  return (
    <div className={styles.container}>

      <div className={styles.mainContent}>
        <h2 className={styles.title}>My Closet</h2>

        {/* כפתורי קטגוריות */}
        <div className={styles.categoriesWrapper}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              className={`${styles.categoryButton} ${
                (!categoryFilter && cat === "All") || categoryFilter === cat
                  ? styles.active
                  : ""
              }`}
              onClick={() => setCategoryFilter(cat === "All" ? null : cat)}
            >
              {cat}
            </button>
          ))}

          {/* כפתור לפתיחת הפילטר בצד */}
          <button
            className={styles.openFilterButton}
            onClick={() => setShowFilterSidebar(!showFilterSidebar)}
          >
            ☰ Filter
          </button>
        </div>

        <div className={styles.closetContent}>
          {/* סרגל פילטר בצד */}
          {showFilterSidebar && (
            <div className={styles.filterSidebar}>
              <div className={styles.filterSection}>
                <button
                  onClick={() =>
                    setActiveFilterSection(activeFilterSection === "color" ? null : "color")
                  }
                >
                  Color
                </button>
                {activeFilterSection === "color" && (
                  <div className={styles.colorOptions}>
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
                      />
                    ))}
                  </div>
                )}
              </div>

              <div className={styles.filterSection}>
                <button
                  onClick={() =>
                    setActiveFilterSection(activeFilterSection === "style" ? null : "style")
                  }
                >
                  Style
                </button>
                {activeFilterSection === "style" && (
                  <div className={styles.optionList}>
                    {STYLES.map((style) => (
                      <button
                        key={style}
                        className={`${styles.optionButton} ${
                          styleFilter === style ? styles.active : ""
                        }`}
                        onClick={() =>
                          setStyleFilter(styleFilter === style ? null : style)
                        }
                      >
                        {style}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className={styles.filterSection}>
                <button
                  onClick={() =>
                    setActiveFilterSection(activeFilterSection === "season" ? null : "season")
                  }
                >
                  Season
                </button>
                {activeFilterSection === "season" && (
                  <div className={styles.optionList}>
                    {SEASONS.map((season) => (
                      <button
                        key={season}
                        className={`${styles.optionButton} ${
                          seasonFilter === season ? styles.active : ""
                        }`}
                        onClick={() =>
                          setSeasonFilter(seasonFilter === season ? null : season)
                        }
                      >
                        {season}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* תצוגת תמונות */}
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
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData("application/json", JSON.stringify(item));
                  }}
                />
            
              </div>
            ))}
          </div>
        )}
        </div>
      </div>

    </div>
  );
};

export default MyCloset;
