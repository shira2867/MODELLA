"use client";
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import styles from "./MyLooks.module.css";
import LookCard from "../LookCard/LookCard";
import { ClothingItem } from "@/types/clothTypes";
import { LookType } from "@/types/lookTypes";
import { fetchLooks } from "@/services/client/look";
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
  const [styleFilter, setStyleFilter] = useState<string>("All");
  const [colorFilter, setColorFilter] = useState<string | null>(null);
  const [seasonFilter, setSeasonFilter] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { data: looks = [], isLoading } = useQuery<LookType[], Error>({
    queryKey: ["looks", userId],
    queryFn: () => fetchLooks(userId),
    staleTime: 5 * 60 * 1000, // 5 דקו
  });

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

    return styleMatch && colorMatch && seasonMatch;
  });

  return (
    <div className={styles.container}>
      <div className={styles.pageContainer}>
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

      {isLoading ? (
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
    </div>
  );
};

export default MyLooks;
