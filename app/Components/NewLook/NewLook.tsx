"use client";

import React, { useState, FC, useCallback } from "react";
import Image from "next/image";
import styles from "./NewLook.module.css";
import down from "../../../public/down.png";
import { useUserStore } from "../../../store/userStore";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ClothingItem } from "@/types/clothTypes";
import { LookType } from "@/types/lookTypes";
import { analyzeImageColors } from '@/services/client/imageAnalysis';

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

  const handleImageUpload: React.ChangeEventHandler<HTMLInputElement> = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setUploadedImage(reader.result as string);
    };
    reader.readAsDataURL(file);

    setIsAnalyzing(true);
    setInspirationColors([]); 
    
try {
      const colors = await analyzeImageColors(file); 
      setInspirationColors(colors); 
      console.log("Colors for filtering:", colors);
    } catch (error) {
      console.error("Image analysis failed", error);
      alert("Failed to analyze image colors.");
      setInspirationColors([]);
    } finally {
      setIsAnalyzing(false);
    }
  };
  const mutation = useMutation({
    mutationFn: postLook,
    onSuccess: (data) => {
      console.log("Look saved:", data.look);
      setSelectedItems([]);
      handleClose();
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

  return (
    <div className={styles.container}>
      {!isOpen ? (
        <>
          <h1 className={styles.title}>
            You want to create a new look? <br /> Click here
          </h1>
          <Image src={down} alt="down arrow" width={60} height={60} />
          <br />
          <div className={styles.initialButtons}>
            <button
              className={styles.openBtn}
              onClick={() => handleOpen("default")}
            >
              Create New Look
            </button>
            <button
              className={styles.openInspirationBtn}
              onClick={() => handleOpen("inspiration")}
            >
              Look From Inspiration
            </button>
          </div>
        </>
      ) : (
        <div className={styles.lookWrapper}>
          <button
            className={styles.closeBtn}
            onClick={handleClose}
            title="Close Look Area"
          >
            ❌
          </button>

          {lookMode === "inspiration" && (
            <div className={styles.inspirationArea}>
              <h3>Look From Inspiration </h3>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={isAnalyzing}
                className={styles.fileInput}
              />
              {isAnalyzing && (
                <p className={styles.analysisStatus}>
                  Analyzing image... Hang tight! ⏳
                </p>
              )}
              {uploadedImage && (
                <div className={styles.uploadedImageWrapper}>
                  <img
                    src={uploadedImage}
                    alt="Inspiration"
                    className={styles.uploadedImage}
                  />
                </div>
              )}
            </div>
          )}

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
            <button
              className={styles.saveBtn}
              onClick={saveLook}
              disabled={mutation.isPending}
            >
              {mutation.isPending ? "Saving..." : "SAVE"}
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
};

export default NewLook;
