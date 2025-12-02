"use client";
import Image from "next/image";
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import LookCard from "../LookCard/LookCard";
import { ClothingItem } from "@/types/clothTypes";
import { LookType } from "@/types/lookTypes";
import { fetchLooks } from "@/services/client/look";
import styles from "./MyLooks.module.css";
import close from "../../../public/remove.png";

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
  const [styleFilter, setStyleFilter] = useState<string | null>("All");
  const [colorFilter, setColorFilter] = useState<string | null>(null);
  const [seasonFilter, setSeasonFilter] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { data: looks = [], isLoading } = useQuery<LookType[], Error>({
    queryKey: ["looks", userId],
    queryFn: () => fetchLooks(userId),
    staleTime: 5 * 60 * 1000,
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

    const styleMatch = styleFilter === "All" || itemStyles.includes(styleFilter!);
    const colorMatch = !colorFilter || itemColors.includes(colorFilter.toLowerCase());
    const seasonMatch =
      !seasonFilter || look.items.some((i) => isItemInSeason(i, seasonFilter));

    return styleMatch && colorMatch && seasonMatch;
  });

  return (
    <div className={styles.container}>
      <div className={styles.mainContent}>
        <button
          type="button"
          className={`${styles.categoryButton} ${styles.filterToggle}`}
          onClick={() => setSidebarOpen(true)}
        >
          Filters
        </button>

        <div
          className={`${styles.sidebarFilter} ${sidebarOpen ? styles.open : ""}`}
          aria-hidden={!sidebarOpen}
        >
          <div className={styles.sidebarHeader}>
            <h3>Filters</h3>
            <p>Refine by color, style, or season.</p>
          </div>
          <button
            type="button"
            className={styles.sidebarClose}
            onClick={() => setSidebarOpen(false)}
          >
            <Image src={close} alt="Close Menu" width={25} height={25} />
            <span>Close</span>
          </button>




          <div className={styles.filterGroup}>
            <p className={styles.filterLabel}>Color</p>
            <div className={styles.colorOptions}>
              {Object.keys(COLOR_MAP).map((color) => (
                <div
                  key={color}
                  className={`${styles.colorCircle} ${colorFilter === color ? styles.activeColor : ""
                    }`}
                  style={{ backgroundColor: `rgb(${COLOR_MAP[color].join(",")})` }}
                  onClick={() => setColorFilter(colorFilter === color ? null : color)}
                  title={color}
                />
              ))}
            </div>
          </div>
          <div className={styles.filterGroup}>
            <p className={styles.filterLabel}>Style</p>
            <div className={styles.optionList}>
              {styleOptions.map((style) => (
                <button
                  key={style}
                  type="button"
                  className={`${styles.filterButton} ${styleFilter === style ? styles.active : ""}`}
                  onClick={() =>
                    setStyleFilter(styleFilter === style ? null : style)
                  }
                >
                  {style}
                </button>
              ))}
            </div>
          </div>
          <div className={styles.filterGroup}>
            <p className={styles.filterLabel}>Season</p>
            <div className={styles.optionList}>
              {seasons.map((s) => (
                <button
                  key={s}
                  type="button"
                  className={`${styles.filterButton} ${seasonFilter === s ? styles.active : ""}`}
                  onClick={() => setSeasonFilter(seasonFilter === s ? null : s)}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        {sidebarOpen && <div className={styles.filterBackdrop} onClick={() => setSidebarOpen(false)} />}

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
