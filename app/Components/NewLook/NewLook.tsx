"use client";
import Image from 'next/image';
import React, { useState, useEffect } from "react";
import styles from "./NewLook.module.css";
import down from '../../../public/down.png';
import { useUserStore } from "../../../store/userStore"; // אם את רוצה משם

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

  // שליפה של userId מהסטור או לוקלסטורג
  const userIdFromStore = useUserStore((state) => state.userId);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const storedUserId = localStorage.getItem("userId") || userIdFromStore;
    setUserId(storedUserId);
  }, [userIdFromStore]);

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
    if (!userId) {
      alert("User not found. Please log in.");
      return;
    }

    if (selectedItems.length === 0) {
      alert("Add at least one clothing item before saving!");
      return;
    }

    const look: LookType = {
      userId,
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
      {!isOpen && (
        <>
          <h1 className={styles.title}>
            you want to create a new look? <br /> click here
          </h1>
          <Image src={down} alt="down arrow" width={60} height={60} />
          <br />
          <button className={styles.openBtn} onClick={() => setIsOpen(true)}>
            Create New Look
          </button>
        </>
      )}

      {isOpen && (
        <div className={styles.lookWrapper}>
          <button
            className={styles.closeBtn}
            onClick={() => setIsOpen(false)}
            title="Close Look Area"
          >
            ❌
          </button>

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
