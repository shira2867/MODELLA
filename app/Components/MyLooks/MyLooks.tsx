"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import styles from "./MyLooks.module.css";
import LookCard from "../LookCard/LookCard";

type ClothingItem = {
  _id: string;
  imageUrl: string;
  category: string;
  thickness: "light" | "medium" | "heavy";
  style: string;
  colorName: string;
};

type Look = {
  _id: string;
  items: ClothingItem[];
  style?: string;
  colorName?: string;
};

type MyLooksProps = {
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

const styleOptions = ["All", "casual", "formal", "sporty", "party"];
const seasons = ["Spring", "Summer", "Autumn", "Winter"];

const MyLooks: React.FC<MyLooksProps> = ({ userId }) => {
  const [looks, setLooks] = useState<Look[]>([]);
  const [loading, setLoading] = useState(true);

  const [styleFilter, setStyleFilter] = useState<string>("All");
  const [colorFilter, setColorFilter] = useState<string | null>(null);
  const [seasonFilter, setSeasonFilter] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const fetchLooks = async () => {
      try {
        const res = await axios.get(`/api/looks?userId=${userId}`);
        const looksWithDominants: Look[] = res.data.map((look: Look) => {
          const colorCount: Record<string, number> = {};
          look.items.forEach((i) => {
            const name = i.colorName || "Black";
            colorCount[name] = (colorCount[name] || 0) + 1;
          });
          const dominantColor =
            Object.entries(colorCount).sort((a, b) => b[1] - a[1])[0]?.[0] ||
            "Black";

          const styleCount: Record<string, number> = {};
          look.items.forEach((i) => {
            const style = i.style || "casual";
            styleCount[style] = (styleCount[style] || 0) + 1;
          });
          const dominantStyle =
            Object.entries(styleCount).sort((a, b) => b[1] - a[1])[0]?.[0] ||
            "casual";

          return {
            ...look,
            colorName: dominantColor,
            style: dominantStyle,
          };
        });
        setLooks(looksWithDominants);
      } catch (err) {
        console.error("Failed to fetch looks", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLooks();
  }, [userId]);

  const isItemInSeason = (item: ClothingItem, season: string) => {
    switch (season) {
      case "Spring":
        return item.thickness === "light" || item.thickness === "medium";
      case "Summer":
        return item.thickness === "light";
      case "Autumn":
        return item.thickness === "medium" || item.thickness === "heavy";
      case "Winter":
        return item.thickness === "heavy";
      default:
        return true;
    }
  };

  const filteredLooks = looks.filter((look) => {
    const itemColors = look.items.map((i) => (i.colorName || "").toLowerCase());
    const itemStyles = look.items.map((i) => i.style || "casual");

    const styleMatch = styleFilter === "All" || itemStyles.includes(styleFilter);
    const colorMatch = !colorFilter || itemColors.includes(colorFilter.toLowerCase());
    const seasonMatch =
      !seasonFilter || look.items.some((i) => isItemInSeason(i, seasonFilter));
    console.log("Filtering look", "lookID", look._id, { styleMatch, colorMatch, seasonMatch });
    return styleMatch && colorMatch && seasonMatch;
  });

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>My Looks</h2>

      <button
        className={styles.sidebarToggle}
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        Filters
      </button>

      <div className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ""}`}>
        <button className={styles.closeSidebar} onClick={() => setSidebarOpen(false)}>
          ×
        </button>

        <h3 className={styles.filterTitle}>Style</h3>
        {styleOptions.map((opt) => (
          <button
            key={opt}
            className={`${styles.filterButton} ${styleFilter === opt ? styles.active : ""}`}
            onClick={() => setStyleFilter(opt)}
          >
            {opt}
          </button>
        ))}

        <h3 className={styles.filterTitle}>Color</h3>
        <div className={styles.colorFilterWrapper}>
          {Object.keys(COLOR_MAP).map((color) => (
            <div
              key={color}
              className={`${styles.colorCircle} ${colorFilter === color ? styles.activeColor : ""}`}
              style={{ backgroundColor: `rgb(${COLOR_MAP[color].join(",")})` }}
              onClick={() => setColorFilter(colorFilter === color ? null : color)}
              title={color}
            />
          ))}
        </div>

        <h3 className={styles.filterTitle}>Season</h3>
        <div className={styles.seasonFilterWrapper}>
          {seasons.map((s) => (
            <button
              key={s}
              className={`${styles.filterButton} ${seasonFilter === s ? styles.active : ""}`}
              onClick={() => setSeasonFilter(seasonFilter === s ? null : s)}
            >
              {s}
            </button>
          ))}
        </div>

      </div>
      {loading ? (
        <p>Loading...</p>
      ) : filteredLooks.length === 0 ? (
        <p>No looks found.</p>
      ) : (
        <div className={styles.cardsWrapper}>
          {filteredLooks.map((look) => (
            <LookCard key={look._id} items={look.items} lookId={look._id} />
          ))}
        </div>
      )}
    </div>
  );
};

export default MyLooks;
