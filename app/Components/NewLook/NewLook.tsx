"use client";
import Image from 'next/image';
import React, { useState } from "react";
import styles from "./NewLook.module.css";
import down from '../../../public/down.png';

type ClothingItem = {
  _id: string;
  imageUrl: string;
  categoryId: string;
  category: string;
  colorName: string;
  thickness: "light" | "medium" | "heavy";
  style: string;
  tags?: string[];
  createdAt?: string;
};

type LookType = {
  userId: string;
  items: ClothingItem[];
  imageUrl?: string;
  createdAt?: string;
};

export default function NewLook() {
  const [selectedItems, setSelectedItems] = useState<ClothingItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const data = event.dataTransfer.getData("application/json");
    if (!data) return;
    const item = JSON.parse(data) as ClothingItem;

    if (!selectedItems.find((i) => i._id === item._id)) {
      setSelectedItems((prev) => [...prev, item]);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const removeItem = (id: string) => {
    setSelectedItems((prev) => prev.filter((i) => i._id !== id));
  };

  const saveLook = async () => {
    if (selectedItems.length === 0) {
      alert("Add at least one clothing item before saving!");
      return;
    }

    const look: LookType = {
      userId: "user_12345",
      items: selectedItems,
      createdAt: new Date().toISOString(),
      imageUrl: "",
    };

    try {
      const response = await fetch("/api/looks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(look),
      });

      const data = await response.json();
      if (response.ok) {
        console.log("Look saved:", data.look);
        setSelectedItems([]);
        setIsOpen(false);
        alert("Look saved successfully!");
      } else {
        console.error("Failed to save Look:", data.error);
        alert("Failed to save Look.");
      }
    } catch (error) {
      console.error("Error saving Look:", error);
      alert("Error saving Look.");
    }
  };

  return (
    <div className={styles.container}>
      {/* הכותרת והחץ במרכז, יופיעו רק כשהאזור סגור */}
      {!isOpen && (
        <>
          <h1 className={styles.title}>
            you want to create a new look? <br /> click here
          </h1>
          <Image src={down} alt="down arrow" width={50} height={50} />
          <button className={styles.openBtn} onClick={() => setIsOpen(true)}>
            Create New Look
          </button>
        </>
      )}

      {/* אזור ה-Look */}
      {isOpen && (
        <div className={styles.lookWrapper}>
          {/* כפתור סגירה */}
          <button
            className={styles.closeBtn}
            onClick={() => setIsOpen(false)}
            title="Close Look Area"
          >
            ❌
          </button>

          {/* אזור הדרופ */}
          <div
            className={styles.lookArea}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            {selectedItems.length === 0 ? (
              <p className={styles.hint}>Drag clothes here</p>
            ) : (
              selectedItems.map((item) => (
                <div key={item._id} className={styles.lookItem}>
                  <img src={item.imageUrl} alt={item.category} />
                  <button onClick={() => removeItem(item._id)}>🗑️</button>
                </div>
              ))
            )}
          </div>

          {/* כפתורי פעולה */}
          <div className={styles.buttons}>
            <button className={styles.saveBtn} onClick={saveLook}>
              SAVE            
            </button>
            <button
              className={styles.cancelBtn}
              onClick={() => setSelectedItems([])}
            >
              CANCEL
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
