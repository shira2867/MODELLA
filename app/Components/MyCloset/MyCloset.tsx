"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import axios from "axios";
import Footer from "../Footer/Footer";
import styles from "./MyCloset.module.css";
import close from '../../../public/remove.png';

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
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [colorFilter, setColorFilter] = useState<string | null>(null);
  const [styleFilter, setStyleFilter] = useState<string | null>(null);
  const [seasonFilter, setSeasonFilter] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

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
        <div className={styles.categoryFilterRow}>
          <div className={styles.categoryRow}>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                className={`${styles.categoryButton} ${categoryFilter === cat ? styles.active : ""}`}
                onClick={() => setCategoryFilter(cat === "All" ? null : cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          {!showFilters && (
            <button
              className={styles.filterToggle}
              onClick={() => setShowFilters(true)}
            >
              ☰ filter
            </button>
          )}
        </div>

        <div className={`${styles.sidebarFilter} ${showFilters ? styles.open : ""}`}>
          <button
            className={styles.filterToggle}
            onClick={() => setShowFilters(false)}
            style={{ alignSelf: "flex-end", marginBottom: "1rem" }}
          >
            <Image src={close} alt="Close Menu" width={30} height={30} />
          </button>

          {/* קטגוריות – רק במסכים קטנים */}
          <div className={styles.categoryRowMobile}>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                className={`${styles.categoryButton} ${categoryFilter === cat ? styles.active : ""}`}
                onClick={() => setCategoryFilter(cat === "All" ? null : cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className={styles.filterGroup}>
            <label>Color:</label>
            <div className={styles.colorOptions}>
              {Object.keys(COLOR_MAP).map((color) => (
                <div
                  key={color}
                  className={`${styles.colorCircle} ${colorFilter === color ? styles.activeColor : ""}`}
                  style={{ backgroundColor: `rgb(${COLOR_MAP[color].join(",")})` }}
                  onClick={() => setColorFilter(colorFilter === color ? null : color)}
                />
              ))}
            </div>
          </div>

          <div className={styles.filterGroup}>
            <label>Style:</label>
            <div className={styles.optionList}>
              {STYLES.map((style) => (
                <button
                  key={style}
                  className={`${styles.filterButton} ${styleFilter === style ? styles.active : ""}`}
                  onClick={() => setStyleFilter(styleFilter === style ? null : style)}
                >
                  {style}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.filterGroup}>
            <label>Season:</label>
            <div className={styles.optionList}>
              {SEASONS.map((season) => (
                <button
                  key={season}
                  className={`${styles.filterButton} ${seasonFilter === season ? styles.active : ""}`}
                  onClick={() => setSeasonFilter(seasonFilter === season ? null : season)}
                >
                  {season}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className={styles.closetContent}>
          {loading ? (
            <p className={styles.loading}>Loading...</p>
          ) : filteredClothes.length === 0 ? (
            <p className={styles.noClothes}>No items found.</p>
          ) : (
            <div className={styles.cardsWrapper}>
              {filteredClothes.map((item) => (
                <div key={item._id} className={styles.card}>
                  <div className={styles.imageWrapper}>
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
