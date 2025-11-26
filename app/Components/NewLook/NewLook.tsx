"use client";

import React, { useState, FC } from "react";
import Image from "next/image";
import styles from "./NewLook.module.css";
import down from '../../../public/down.png';
import { useUserStore } from "../../../store/userStore"; 
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ClothingItem } from "@/types/clothTypes";
import { LookType } from "@/types/lookTypes";

// פונקציה ששולחת את ה-look לשרת
const postLook = async (look: LookType) => {
  const res = await fetch("/api/looks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(look),
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || "Failed to save look");
  }

  return res.json();
};

const NewLook: FC = () => {
  const [selectedItems, setSelectedItems] = useState<ClothingItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const userId = useUserStore((state) => state.userId); // נטען ישירות מה-store
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: postLook,
    onSuccess: (data) => {
      console.log("Look saved:", data.look);
      setSelectedItems([]);
      setIsOpen(false);
      alert("Look saved successfully!");
      queryClient.invalidateQueries({ queryKey: ["looks"] });
    },
    onError: (error: any) => {
      console.error("Error saving Look:", error.message);
      alert("Failed to save Look.");
    },
  });

  const handleDrop: React.DragEventHandler<HTMLDivElement> = (event) => {
    event.preventDefault();
    const data = event.dataTransfer.getData("application/json");
    if (!data) return;

    try {
      const item: ClothingItem = JSON.parse(data);
      if (!selectedItems.some((i) => i._id === item._id)) {
        setSelectedItems((prev) => [...prev, item]);
      }
    } catch (err) {
      console.error("Invalid dragged item data", err);
    }
  };

  const handleDragOver: React.DragEventHandler<HTMLDivElement> = (event) => {
    event.preventDefault();
  };

  const removeItem = (id: string) => {
    setSelectedItems((prev) => prev.filter((i) => i._id !== id));
  };

  const saveLook = () => {
    if (!userId) {
      alert("User not found. Please log in.");
      return;
    }
    if (selectedItems.length === 0) {
      alert("Add at least one clothing item before saving!");
      return;
    }

    const look: LookType = {
      _id: "",
      userId,
      items: selectedItems,
      createdAt: new Date(),
    };

    mutation.mutate(look);
  };

  const selectedCount = selectedItems.length;
  const hasItems = selectedCount > 0;

  return (
    <section className={styles.container} aria-live="polite">
      <div
        className={`${styles.panel} ${isOpen ? styles.panelExpanded : styles.panelCollapsed}`}
      >
        {!isOpen ? (
          <button
            type="button"
            className={styles.openCard}
            onClick={() => setIsOpen(true)}
            aria-expanded={isOpen}
            aria-controls="create-look-panel"
          >
            <p className={styles.cardEyebrow}>Create a new look</p>
            <h2 className={styles.cardTitle}>Tap to curate your next outfit</h2>
            <p className={styles.cardHint}>Drag pieces from your closet once the panel opens.</p>
            <Image src={down} alt="Open look builder" width={52} height={52} />
          </button>
        ) : (
          <div id="create-look-panel" className={styles.lookWrapper}>
            <header className={styles.panelHeader}>
              <div>
                <p className={styles.panelEyebrow}>Create look</p>
                <h3 className={styles.panelTitle}>Build a balanced outfit</h3>
                <p className={styles.panelMeta}>
                  {hasItems ? `${selectedCount} item${selectedCount === 1 ? "" : "s"} selected` : "No items yet"}
                </p>
              </div>
              <button
                type="button"
                className={styles.closeBtn}
                onClick={() => setIsOpen(false)}
                aria-label="Close look builder"
              >
                ✕
              </button>
            </header>

            <p className={styles.helperText}>
              Drag &amp; drop garments from the closet grid. Remove items any time.
            </p>

            <div
              className={`${styles.lookArea} ${hasItems ? styles.lookAreaFilled : ""}`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
            >
              {hasItems ? (
                selectedItems.map((item) => (
                  <div key={item._id} className={styles.lookItem}>
                    <img src={item.imageUrl} alt={item.category} loading="lazy" />
                    <button
                      type="button"
                      onClick={() => removeItem(item._id)}
                      aria-label={`Remove ${item.category}`}
                    >
                      Remove
                    </button>
                  </div>
                ))
              ) : (
                <div className={styles.emptyState}>
                  <p>Drag garments here to start styling.</p>
                  <span>Tip: mix textures &amp; tones for balance.</span>
                </div>
              )}
            </div>

            <div className={styles.actionBar}>
              <button
                type="button"
                className={styles.primaryButton}
                onClick={saveLook}
                disabled={mutation.isPending}
              >
                {mutation.isPending ? "Saving..." : "Save look"}
              </button>
              <button
                type="button"
                className={styles.secondaryButton}
                onClick={() => setSelectedItems([])}
                disabled={!hasItems || mutation.isPending}
              >
                Reset
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default NewLook;
