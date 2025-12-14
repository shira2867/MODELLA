"use client";

import React, { useState, FC, useCallback } from "react";
import Image from "next/image";
import styles from "./NewLook.module.css";
import down from "../../../public/down.png";
import { useUserStore } from "../../../store/userStore";
import { useToast } from "../Toast/ToastProvider";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ClothingItem } from "@/types/clothTypes";
import { LookType } from "@/types/lookTypes";
import {
  RGB,
  closestColorLAB,
  getDominantColorsKMeans,
} from "@/services/server/colorUtils";

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

interface NewLookProps {
  setInspirationColors: (colors: string[]) => void;
  lookMode: "default" | "inspiration";
  onModeChange: (mode: "default" | "inspiration") => void;
}

const NewLook: FC<NewLookProps> = ({
  setInspirationColors,
  lookMode,
  onModeChange,
}) => {
  const [selectedItems, setSelectedItems] = useState<ClothingItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { showToast } = useToast();
  const userId = useUserStore((state) => state.userId);
  const queryClient = useQueryClient();

  const handleOpen = useCallback(
    (mode: "default" | "inspiration") => {
      onModeChange(mode);
      setIsOpen(true);
      setUploadedImage(null);
      setInspirationColors([]);
    },
    [onModeChange, setInspirationColors]
  );

  const handleClose = useCallback(() => {
    setIsOpen(false);
    onModeChange("default");
    setUploadedImage(null);
    setInspirationColors([]);
  }, [onModeChange, setInspirationColors]);

  const handleImageUpload: React.ChangeEventHandler<HTMLInputElement> = async (
    event
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => setUploadedImage(reader.result as string);
    reader.readAsDataURL(file);

    setIsAnalyzing(true);
    setInspirationColors([]);

    try {
      const img = document.createElement("img");
      img.src = URL.createObjectURL(file);
      img.onload = () => {
        const topColorsRGB = getDominantColorsKMeans(img, 4);
        const colorNames = topColorsRGB.map(closestColorLAB);
        setInspirationColors(colorNames);
        console.log("Detected colors:", colorNames);
        setIsAnalyzing(false);
      };
    } catch (error) {
      console.error("Image analysis failed", error);
      showToast("Failed to analyze image colors.", "error");
      setInspirationColors([]);
      setIsAnalyzing(false);
    }
  };

  const mutation = useMutation({
    mutationFn: postLook,
    onSuccess: () => {
      setSelectedItems([]);
      handleClose();
      showToast("Look saved successfully!", "success");
      queryClient.invalidateQueries({ queryKey: ["looks"] });
    },
    onError: (error: any) => {
      console.error("Error saving Look:", error.message);
      showToast("Failed to save Look.", "error");
    },
  });


  const handleDrop: React.DragEventHandler<HTMLDivElement> = (event) => {
    event.preventDefault();
    const data = event.dataTransfer.getData("application/json");
    if (!data) return;

    try {
      const item: ClothingItem = JSON.parse(data);

      const categoryExists = selectedItems.some(
        (i) => i.category.toLowerCase() === item.category.toLowerCase()
      );

      if (categoryExists) {
        showToast(`You already added a ${item.category} to the look.`, "error");
        return; 
      }

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

  const removeItem = (id: string) =>
    setSelectedItems((prev) => prev.filter((i) => i._id !== id));

  const saveLook = () => {
    if (!userId) return showToast("User not found. Please log in.", "error");
    if (selectedItems.length === 0)
      return showToast(
        "Add at least one clothing item before saving!",
        "error"
      );

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
      <div className={styles.shell}>
        {!isOpen ? (
          <div className={styles.introCard}>
            <div className={styles.introContent}>
              <div className={styles.introCopy}>
                <p className={styles.cardEyebrow}>Create a look</p>
                <h1 className={styles.cardTitle}>Craft your next outfit</h1>
                <p className={styles.cardHint}>
                  Drag pieces from My Closet into the builder.
                </p>
              </div>
              <Image
                src={down}
                alt="Open look builder"
                width={56}
                height={56}
                className={styles.introIcon}
              />
            </div>

            <div className={styles.introActions}>
              <button
                className={`${styles.ctaButton} ${styles.primaryCta}`}
                onClick={() => handleOpen("default")}
              >
                Create New Look
              </button>
              <button
                className={`${styles.ctaButton} ${styles.secondaryCta}`}
                onClick={() => handleOpen("inspiration")}
              >
                Look From Inspiration
              </button>
            </div>
          </div>
        ) : (
          <div id="create-look-panel" className={styles.builderCard}>
            <header className={styles.panelHeader}>
              <div>
                <p className={styles.panelEyebrow}>Create look</p>
                <h3 className={styles.panelTitle}>Build a balanced outfit</h3>
                <p className={styles.panelMeta}>
                  {hasItems
                    ? `${selectedCount} item${
                        selectedCount === 1 ? "" : "s"
                      } selected`
                    : "No items yet"}
                </p>
              </div>
              <button
                type="button"
                className={styles.closeBtn}
                onClick={handleClose}
                aria-label="Close look builder"
              >
                ✕
              </button>
            </header>

            <div className={styles.scrollRegion}>
              <p className={styles.helperText}>
                Drag &amp; drop garments from your closet grid. Remove items any
                time.
              </p>

              {lookMode === "inspiration" && (
                <div className={styles.inspirationArea}>
                  {uploadedImage ? (
                    <div className={styles.uploadedImageContent}>
                      <img
                        src={uploadedImage}
                        alt="Inspiration"
                        className={styles.uploadedImage}
                      />
                      <button
                        className={styles.resetImageBtn}
                        onClick={() => {
                          setUploadedImage(null);
                          setInspirationColors([]);
                        }}
                      >
                        Change Image
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className={styles.inspirationText}>
                        <h3>Look From Inspiration</h3>
                        <p>Upload a mood image to pull guiding colors.</p>
                      </div>

                      <label className={styles.fileField}>
                        <span>
                          {isAnalyzing ? "Analyzing..." : "Upload image"}
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          disabled={isAnalyzing}
                        />
                      </label>

                      {isAnalyzing && (
                        <p className={styles.analysisStatus}>
                          Analyzing image... Hang tight! ⏳
                        </p>
                      )}
                    </>
                  )}
                </div>
              )}

              <div
                className={`${styles.lookArea} ${
                  hasItems ? styles.lookAreaFilled : ""
                }`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
              >
                {hasItems ? (
                  selectedItems.map((item) => (
                    <div key={item._id} className={styles.lookItem}>
                      <img
                        src={item.imageUrl}
                        alt={item.category}
                        loading="lazy"
                      />
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
            </div>

            <div className={styles.actionBar}>
              <button
                type="button"
                onClick={saveLook}
                disabled={mutation.isPending}
              >
                {mutation.isPending ? "Saving..." : "Save look"}
              </button>
              <button
                type="button"
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
