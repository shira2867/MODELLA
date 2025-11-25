"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import Image from "next/image";
import down from "../../../public/img/down.png";
import styles from "./LookCreator.module.css";
  import {ClothingItem} from '@/types/clothTypes'
import {LookType as Look} from '@/types/lookTypes'




type Props = {
  look: Look;
};

export default function BuildSimilarLook({ look }: Props) {
  const [userId, setUserId] = useState<string | null>(null);
  const [userItems, setUserItems] = useState<Record<string, ClothingItem[]>>({});
  const [selectedItems, setSelectedItems] = useState<Record<string, ClothingItem>>({});
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");
    if (storedUserId) setUserId(storedUserId);
  }, []);

  const { data: allUserItems } = useQuery({
    queryKey: ["userItems", userId],
    queryFn: async () => {
      if (!userId) return [];
      const res = await axios.get(`/api/clothing?userId=${userId}`);
      return res.data as ClothingItem[];
    },
    enabled: !!userId,
  });

  useEffect(() => {
    if (!look || !allUserItems) return;

    const filtered: Record<string, ClothingItem[]> = {};
 look.items.forEach((item) => {
  filtered[item.category] = allUserItems.filter(
    (i) =>
      i.category === item.category &&
      i.colorName &&         
      item.colorName &&       
      i.colorName.toLowerCase() === item.colorName.toLowerCase()
  );
});
    setUserItems(filtered);
  }, [look, allUserItems]);

  const handleSelect = (category: string, item: ClothingItem) => {
    setSelectedItems((prev) => ({ ...prev, [category]: item }));
    setActiveCategory(null);
  };

  const buildNewLook = () => {
    if (!look) return [];
    return look.items
      .map((item) => selectedItems[item.category])
      .filter(Boolean);
  };

  const newLook = buildNewLook();

  const handleConfirm = async () => {
    if (!userId || !look) return;
    try {
      const res = await axios.post("/api/looks", { userId, items: newLook });
      alert("New Look created!");
      console.log("Saved look:", res.data);
    } catch (err) {
      console.error("Error saving look:", err);
      alert("Error saving look");
    }
  };

  if (!look) return <p>Look not found</p>;

  return (
    <div className={styles.container}>
      <div className={styles.header} onClick={() => setIsOpen(!isOpen)}>
        <h1 className={styles.title}>Do you want to create a new look?</h1>
        <Image
          src={down}
          alt="down arrow"
          className={`${styles.arrow} ${isOpen ? styles.open : ""}`}
        />
      </div>

      {isOpen && (
        <>
          <div className={styles.lookRow}>
            {look.items.map((item) => (
              <div key={item._id}>
                <img
                  className={`${styles.lookImage} ${
                    activeCategory === item.category ? styles.activeCategory : ""
                  }`}
                  src={item.imageUrl}
                  alt={item.category}
                  onClick={() =>
                    setActiveCategory(
                      activeCategory === item.category ? null : item.category
                    )
                  }
                />
              </div>
            ))}
          </div>

          {activeCategory && (
            <div className={styles.selectionContainer}>
              {userItems[activeCategory] && userItems[activeCategory].length > 0 ? (
                userItems[activeCategory].map((userItem) => (
                  <img
                    key={userItem._id}
                    className={`${styles.userItem} ${
                      selectedItems[activeCategory]?._id === userItem._id
                        ? styles.selectedItem
                        : ""
                    }`}
                    src={userItem.imageUrl}
                    alt={userItem.category}
                    onClick={() => handleSelect(activeCategory, userItem)}
                  />
                ))
              ) : (
                <p style={{ color: "#5c1a1a", fontWeight: 600, textAlign: "center" }}>
                  No matching items found in this category. Try adding some to complete your look!
                </p>
              )}
            </div>
          )}

          <h2 className={styles.subtitle}>Preview of New Look</h2>
          <div className={styles.previewContainer}>
            {newLook.length === 0 ? (
              <p>No items selected yet</p>
            ) : (
              newLook.map((item, index) => (
                <img key={item._id + "-" + index} src={item.imageUrl} alt={item.category} />
              ))
            )}
          </div>

          <div className={styles.buttonContainer}>
            <button className={styles.button} onClick={handleConfirm}>
              Confirm Look
            </button>
          </div>
        </>
      )}
    </div>
  );
}
