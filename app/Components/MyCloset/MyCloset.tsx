"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import styles from "./MyCloset.module.css";
import close from "../../../public/remove.png";
import all from "../../../public/summer_11907165.png";
import coat from "../../../public/clothes_15930120.png";
import shirt from "../../../public/crop-top_10339535.png";
import accessories from "../../../public/accessories_5029392.png";
import DeleteHandleLooksModal from "../DeleteHandleLooksModal/DeleteHandleLooksModal";
import pants from "../../../public/short_13387117.png";
import { ClothingItem } from "@/types/clothTypes";
import { FaTrash } from "react-icons/fa";
import { FaTshirt, FaHatCowboy, FaUserTie, FaMale } from "react-icons/fa";
import { GiClothes, GiLargeDress, GiSkirt } from "react-icons/gi";
import { fetchClothes } from "@/services/client/closet";

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
  {
    key: "All",
    image: <Image src={all} alt="All clothes" width={30} height={30} />,
  },
  {
    key: "shirt",
    image: <Image src={shirt} alt="shirt" width={30} height={30} />,
  },
  {
    key: "pants",
    image: <Image src={pants} alt="pants" width={30} height={30} />,
  },
  {
    key: "Jacket&coat",
    image: <Image src={coat} alt="coat" width={30} height={30} />,
  },
  {
    key: "dress",
    image: <Image src={all} alt="dress" width={30} height={30} />,
  },
  {
    key: "Skirts",
    image: <Image src={all} alt="skirt" width={30} height={30} />,
  },
  {
    key: "Shoes",
    image: <Image src={all} alt="shoes" width={30} height={30} />,
  },
  {
    key: "Accessories",
    image: <Image src={accessories} alt="Accessories" width={30} height={30} />,
  },
];

const STYLES = ["casual", "sporty", "formal", "party"];
const SEASONS = ["Spring", "Summer", "Autumn", "Winter"];

type MyClosetProps = {
  userId: string;
  inspirationColors: string[];
};

const MyCloset: React.FC<MyClosetProps> = ({ userId, inspirationColors }) => {
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [colorFilter, setColorFilter] = useState<string | null>(null);
  const [styleFilter, setStyleFilter] = useState<string | null>(null);
  const [seasonFilter, setSeasonFilter] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const filterPanelId = "closet-filter-panel";

  const [selectedClothing, setSelectedClothing] = useState<ClothingItem  | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const { data: clothes = [], isLoading } = useQuery<ClothingItem[], Error>({
    queryKey: ["clothes", userId],
    queryFn: () => fetchClothes(userId),
  });

  const filteredClothes = clothes.filter((item) => {
    if (
      categoryFilter &&
      categoryFilter !== "All" &&
      item.category !== categoryFilter
    )
      return false;
    if (
      inspirationColors.length === 0 &&
      colorFilter &&
      item.colorName !== colorFilter
    )
      return false;
    if (inspirationColors.length > 0) {
      if (!item.colorName || !inspirationColors.includes(item.colorName)) {
        return false;
      }
    }
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

  let closetContent: React.ReactNode;
  if (isLoading) {
    closetContent = <p className={styles.loading}>Loading...</p>;
  } else if (filteredClothes.length === 0) {
    closetContent = <p className={styles.noClothes}>No items found.</p>;
  } else {
    closetContent = (
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
                  e.dataTransfer.setData(
                    "application/json",
                    JSON.stringify(item)
                  );
                }}
              />
            </div>
            <button
              onClick={() => {
                setSelectedClothing(item);
                setModalOpen(true);
              }}
              className={styles.deleteButton}
            >
              <FaTrash aria-hidden />
              <span className="sr-only">Delete item</span>
            </button>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.mainContent}>
        <div className={styles.categoryFilterRow}>
          <div className={styles.categoryRow}>
            {CATEGORIES.map((cat) => (
              <button
                key={cat.key}
                type="button"
                className={`${styles.categoryButton} ${
                  categoryFilter === cat.key ? styles.active : ""
                }`}
                onClick={() =>
                  setCategoryFilter(cat.key === "All" ? null : cat.key)
                }
                aria-pressed={categoryFilter === cat.key}
                aria-label={`Filter by ${cat.key}`}
              >
                <span className="sr-only">{`Filter by ${cat.key}`}</span>
                <span className={styles.categoryText}>
                  {cat.key === "All" ? "All clothes" : cat.key}
                </span>
              </button>
            ))}
          </div>
          {!showFilters && (
            <button
              type="button"
              className={`${styles.categoryButton} ${styles.filterToggle}`}
              onClick={() => setShowFilters(true)}
              aria-expanded={showFilters}
              aria-controls={filterPanelId}
            >
              <span className={styles.categoryText}>Filters</span>
            </button>
          )}
        </div>

        <div
          id={filterPanelId}
          className={`${styles.sidebarFilter} ${
            showFilters ? styles.open : ""
          }`}
          aria-hidden={!showFilters}
        >
          <div className={styles.sidebarHeader}>
            <h3>Filters</h3>
            <p>Refine by color, style, or season.</p>
          </div>
          <button
            type="button"
            className={styles.sidebarClose}
            onClick={() => setShowFilters(false)}
            aria-label="Hide filters"
          >
            <Image src={close} alt="Close Menu" width={30} height={30} />
            <span>Close</span>
          </button>
          {inspirationColors.length > 0 && (
            <div className={styles.filterGroup}>
              <label className={styles.inspirationLabel}>
                Inspired Look Active:
                <span style={{ fontWeight: "bold", color: "#5c1a1a" }}>
                  Filtering by {inspirationColors.length} colors!
                </span>
              </label>
              <div className={styles.optionList}>
                {inspirationColors.map((color) => (
                  <span key={color} className={styles.inspirationColorTag}>
                    {color}
                  </span>
                ))}
              </div>
            </div>
          )}
          {inspirationColors.length === 0 && (
            <div className={styles.filterGroup}>
              <label>Color:</label>
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
            </div>
          )}

          <div className={styles.filterGroup}>
            <p className={styles.filterLabel}>Style</p>
            <div className={styles.optionList}>
              {STYLES.map((style) => (
                <button
                  key={style}
                  type="button"
                  className={`${styles.filterButton} ${
                    styleFilter === style ? styles.active : ""
                  }`}
                  onClick={() =>
                    setStyleFilter(styleFilter === style ? null : style)
                  }
                  aria-pressed={styleFilter === style}
                >
                  {style}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.filterGroup}>
            <p className={styles.filterLabel}>Season</p>
            <div className={styles.optionList}>
              {SEASONS.map((season) => (
                <button
                  key={season}
                  type="button"
                  className={`${styles.filterButton} ${
                    seasonFilter === season ? styles.active : ""
                  }`}
                  onClick={() =>
                    setSeasonFilter(seasonFilter === season ? null : season)
                  }
                  aria-pressed={seasonFilter === season}
                >
                  {season}
                </button>
              ))}
            </div>
          </div>
        </div>
        {showFilters && (
          <div
            className={styles.filterBackdrop}
            onClick={() => setShowFilters(false)}
            aria-hidden="true"
          />
        )}

        <div className={styles.closetContent}>
          {isLoading ? (
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
                        e.dataTransfer.setData(
                          "application/json",
                          JSON.stringify(item)
                        );
                      }}
                    />
                  </div>
                  <button
                    onClick={() => {
                      setSelectedClothing(item);
                      setModalOpen(true);
                    }}
                    className={styles.deleteButton}
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {selectedClothing && (
        <DeleteHandleLooksModal
          clothingId={selectedClothing._id}
          itemImageUrl={selectedClothing.imageUrl} 
          
          open={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setSelectedClothing(null);
          }}
          onComplete={({ updated, deleted }) => {
            alert(
              updated.length + deleted.length > 0
                ? `Updated ${updated.length} looks, deleted ${deleted.length} looks.`
                : "Item deleted."
            );
          }}
        />
      )}
    </div>
  );
};

export default MyCloset;
