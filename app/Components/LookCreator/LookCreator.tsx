"use client";

import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import Image from "next/image";
import down from "../../../public/img/down.png";
import styles from "./LookCreator.module.css";
import {ClothingItem} from '@/types/clothTypes'
import {LookType as Look} from '@/types/lookTypes'

type Props = {
  readonly look: Look;
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
    for (const item of look.items) {
      filtered[item.category] = allUserItems.filter(
        (i) =>
          i.category === item.category &&
          i.colorName &&
          item.colorName &&
          i.colorName.toLowerCase() === item.colorName.toLowerCase()
      );
    }
    setUserItems(filtered);
  }, [look, allUserItems]);

  useEffect(() => {
    if (!isOpen) {
      setActiveCategory(null);
    }
  }, [isOpen]);

  const handleSelect = (category: string, item: ClothingItem) => {
    setSelectedItems((prev) => ({ ...prev, [category]: item }));
    setActiveCategory(null);
  };

  const buildNewLook = (): ClothingItem[] => {
    if (!look) return [];
    return look.items.reduce<ClothingItem[]>((acc, item) => {
      const selection = selectedItems[item.category];
      if (selection) {
        acc.push(selection);
      }
      return acc;
    }, []);
  };

  const newLook = useMemo(() => buildNewLook(), [look, selectedItems]);

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

  const togglePanel = () => setIsOpen((prev) => !prev);

  return (
    <section className={styles.container}>
      <header className={styles.sectionHeader}>
        <p className={styles.eyebrow}>Closet remix</p>
        <h1 className={styles.title}>Do you want to create a new look?</h1>
        <p className={styles.description}>
          Replace inspiration pieces with items from your closet to build a personalised edit.
        </p>
      </header>

      <button
        type="button"
        className={`${styles.toggle} ${isOpen ? styles.toggleOpen : ""}`}
        onClick={togglePanel}
        aria-expanded={isOpen}
        aria-controls="look-creator-panel"
      >
        <span>{isOpen ? "Hide look builder" : "Show look builder"}</span>
        <Image
          src={down}
          alt="Toggle look builder"
          className={`${styles.arrow} ${isOpen ? styles.open : ""}`}
        />
      </button>

      <section
        id="look-creator-panel"
        className={`${styles.panel} ${isOpen ? styles.panelOpen : ""}`}
        aria-hidden={!isOpen}
        aria-label="Look builder panel"
      >
        <div className={styles.panelBody}>
          <div className={styles.lookRow}>
            {look.items.map((item) => (
              <button
                type="button"
                key={item._id}
                className={`${styles.lookImage} ${
                  activeCategory === item.category ? styles.activeCategory : ""
                }`}
                onClick={() =>
                  setActiveCategory(activeCategory === item.category ? null : item.category)
                }
                aria-pressed={activeCategory === item.category}
                aria-label={`Select ${item.category} to swap`}
              >
                <img src={item.imageUrl} alt={item.category} loading="lazy" />
                <span className={styles.lookLabel}>{item.category}</span>
              </button>
            ))}
          </div>

          {activeCategory && (
            <div className={styles.selectionContainer}>
              <div className={styles.selectionHeader}>
                <p className={styles.selectionTitle}>{activeCategory}</p>
                <p className={styles.selectionHint}>
                  Choose a replacement item to add it to your recreated look.
                </p>
              </div>

              {userItems[activeCategory] && userItems[activeCategory].length > 0 ? (
                <div className={styles.selectionGrid}>
                  {userItems[activeCategory].map((userItem) => (
                    <button
                      key={userItem._id}
                      className={`${styles.userItem} ${
                        selectedItems[activeCategory]?._id === userItem._id
                          ? styles.selectedItem
                          : ""
                      }`}
                      onClick={() => handleSelect(activeCategory, userItem)}
                      type="button"
                      aria-pressed={selectedItems[activeCategory]?._id === userItem._id}
                    >
                      <img src={userItem.imageUrl} alt={userItem.category} loading="lazy" />
                      <span>{userItem.style || userItem.category}</span>
                    </button>
                  ))}
                </div>
              ) : (
                <p className={styles.emptyState}>
                  No matching items found in this category. Try adding some to complete your look!
                </p>
              )}
            </div>
          )}

          <div className={styles.previewSection}>
            <div className={styles.previewHeader}>
              <h2 className={styles.subtitle}>Preview of New Look</h2>
              <p>
                {newLook.length} of {look.items.length} pieces selected
              </p>
            </div>
            <div className={styles.previewContainer}>
              {newLook.length === 0 ? (
                <p className={styles.previewPlaceholder}>Start selecting pieces to see them here.</p>
              ) : (
                newLook.map((item, index) => (
                  <div key={item._id + "-" + index} className={styles.previewItem}>
                    <img src={item.imageUrl} alt={item.category} loading="lazy" />
                    <span>{item.category}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className={styles.buttonContainer}>
            <button className={styles.button} onClick={handleConfirm}>
              Confirm Look
            </button>
          </div>
        </div>
      </section>
    </section>
  );
}
