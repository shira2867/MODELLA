"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import axios from "axios";
import styles from "./MyCloset.module.css";
import close from "../../../public/remove.png";
import all from "../../../public/summer_11907165.png";
import coat from "../../../public/clothes_15930120.png";
import shirt from "../../../public/crop-top_10339535.png";
import Accessories from "../../../public/accessories_5029392.png";
import DeleteHandleLooksModal from "../DeleteHandleLooksModal/DeleteHandleLooksModal"; // נתיב לפי המיקום שלך
import pants from "../../../public/short_13387117.png";
import filter from "../../../public/filter_7420963.png";

// Icons
import { FaTshirt, FaHatCowboy, FaUserTie, FaMale } from "react-icons/fa";
import { GiClothes, GiLargeDress, GiSkirt } from "react-icons/gi";

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
// Modal Component
type ConfirmDeleteProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  lookNames: string[];
};

const ConfirmDelete: React.FC<ConfirmDeleteProps> = ({
  open,
  onClose,
  onConfirm,
  lookNames,
}) => {
  if (!open) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h2>Confirm Delete</h2>
        {lookNames.length > 0 && (
          <>
            <p>This item is used in these looks:</p>
            <ul>
              {lookNames.map((name) => (
                <li key={name}>{name}</li>
              ))}
            </ul>
          </>
        )}
        <p>Are you sure you want to delete this item and all related looks?</p>
        <div className={styles.modalActions}>
          <button onClick={onConfirm} className={styles.confirmButton}>
            Yes, Delete
          </button>
          <button onClick={onClose} className={styles.cancelButton}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
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

// UPDATED: icon-based categories
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
    image: <Image src={all} alt="All clothes" width={30} height={30} />,
  },
  {
    key: "Skirts",
    image: <Image src={all} alt="All clothes" width={30} height={30} />,
  },
  {
    key: "Shoes",
    image: <Image src={all} alt="All clothes" width={30} height={30} />,
  },
  {
    key: "Accessories",
    image: <Image src={Accessories} alt="Accessories" width={30} height={30} />,
  },
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
  /*------*/
  // const [modalOpen, setModalOpen] = useState(false);
  // const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  // const [looksToDelete, setLooksToDelete] = useState<string[]>([]);

  // const handleDeleteClick = async (id: string) => {
  //   try {
  //     const res = await axios.get(`/api/clothing?id=${id}`);
  //     setLooksToDelete(res.data.lookNames);
  //     setSelectedItemId(id);
  //     setModalOpen(true);
  //   } catch (err) {
  //     console.error(err);
  //     alert("Error fetching related looks");
  //   }
  // };

  // const confirmDelete = async () => {
  //   if (!selectedItemId) return;

  //   try {
  //     const res = await axios.delete(`/api/clothing?id=${selectedItemId}`);
  //     if (res.status === 200) {
  //       setClothes(clothes.filter((item) => item._id !== selectedItemId));
  //       alert(
  //         `Item deleted. Deleted looks: ${res.data.deletedLooks.join(", ")}`
  //       );
  //     }
  //   } catch (err) {
  //     console.error(err);
  //     alert("Error deleting item");
  //   } finally {
  //     setModalOpen(false);
  //     setSelectedItemId(null);
  //     setLooksToDelete([]);
  //   }
  // };
  const [selectedClothing, setSelectedClothing] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  /*------*/
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
    if (
      categoryFilter &&
      categoryFilter !== "All" &&
      item.category !== categoryFilter
    )
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
        {/* Top categories row */}
        <div className={styles.categoryFilterRow}>
          <div className={styles.categoryRow}>
            {CATEGORIES.map((cat) => (
              <button
                key={cat.key}
                className={`${styles.categoryButton} ${
                  categoryFilter === cat.key ? styles.active : ""
                }`}
                onClick={() =>
                  setCategoryFilter(cat.key === "All" ? null : cat.key)
                }
              >
                {cat.image}
              </button>
            ))}
          </div>

          {!showFilters && (
            <button
              className={styles.filterToggle}
              onClick={() => setShowFilters(true)}
            >
              <Image src={filter} alt="Filter" width={30} height={30} />{" "}
            </button>
          )}
        </div>

        {/* Sidebar Filters */}
        <div
          className={`${styles.sidebarFilter} ${
            showFilters ? styles.open : ""
          }`}
        >
          <button
            className={styles.filterToggle}
            onClick={() => setShowFilters(false)}
            style={{ alignSelf: "flex-end", marginBottom: "1rem" }}
          >
            <Image src={close} alt="Close Menu" width={30} height={30} />
          </button>

          {/* Categories in mobile */}
          <div className={styles.categoryRowMobile}>
            {CATEGORIES.map((cat) => (
              <button
                key={cat.key}
                className={`${styles.categoryButton} ${
                  categoryFilter === cat.key ? styles.active : ""
                }`}
                onClick={() =>
                  setCategoryFilter(cat.key === "All" ? null : cat.key)
                }
              >
                {cat.image}
                {cat.key}
              </button>
            ))}
          </div>

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

          <div className={styles.filterGroup}>
            <label>Style:</label>
            <div className={styles.optionList}>
              {STYLES.map((style) => (
                <button
                  key={style}
                  className={`${styles.filterButton} ${
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
          </div>

          <div className={styles.filterGroup}>
            <label>Season:</label>
            <div className={styles.optionList}>
              {SEASONS.map((season) => (
                <button
                  key={season}
                  className={`${styles.filterButton} ${
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
          </div>
        </div>

        {/* Closet content */}
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
                        e.dataTransfer.setData(
                          "application/json",
                          JSON.stringify(item)
                        );
                      }}
                    />
                  </div>
                  {/* <button
                    onClick={() => handleDeleteClick(item._id)}
                    className={styles.deleteButton}
                  >
                    Delete
                  </button> */}
                  <button
                    onClick={() => {
                      setSelectedClothing(item._id);
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
      {/* <ConfirmDelete
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={confirmDelete}
        lookNames={looksToDelete}
      /> */}
      {selectedClothing && (
        <DeleteHandleLooksModal
          clothingId={selectedClothing}
          open={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setSelectedClothing(null);
          }}
          onComplete={({ updated, deleted }) => {
            // עדכון UI אחרי ביצוע: נרצה להסיר את הפריט מרשימת הפריטים
            // (פריט נמחק תמיד בסוף התהליך), לכן נסיר אותו מה-state
            setClothes((prev) =>
              prev.filter((c) => c._id !== selectedClothing)
            );
            // אפשר גם להראות הודעה למשתמש
            if ((updated?.length ?? 0) + (deleted?.length ?? 0) > 0) {
              alert(
                `Updated ${updated.length} looks, deleted ${deleted.length} looks.`
              );
            } else {
              alert("Item deleted.");
            }
          }}
        />
      )}
    </div>
  );
};

export default MyCloset;
