"use client";

import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import styles from "./LookCreator.module.css";
import { ClothingItem } from "@/types/clothTypes";
import { LookType as Look } from "@/types/lookTypes";
import { updateClick } from "@/services/client/clickSuggestions";

type Props = {
  readonly look: Look;
};

export default function BuildSimilarLook({ look }: Props) {
  const [userId, setUserId] = useState<string | null>(null);
  const [userItems, setUserItems] = useState<Record<string, ClothingItem[]>>(
    {}
  );
  const [selectedItems, setSelectedItems] = useState<
    Record<string, ClothingItem>
  >({});
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [noteCandidate, setNoteCandidate] = useState<{ text: string } | null>(
    null
  );
  const [existingNotes, setExistingNotes] = useState<string[]>([]);

  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");
    if (storedUserId) setUserId(storedUserId);
  }, []);
  const { data: userChecklist } = useQuery({
    queryKey: ["userChecklist", userId],
    queryFn: async () => {
      if (!userId) return [];
      const res = await axios.get(`/api/checklist?userId=${userId}`);
      return res.data as { text: string; _id: string }[];
    },
    enabled: !!userId,
  });
  useEffect(() => {
    if (userChecklist) {
      setExistingNotes(userChecklist.map((note) => note.text));
    }
  }, [userChecklist]);
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

  const handleCategoryClick = async (item: ClothingItem) => {
    if (!userId) return;
    const category = item.category;
    const colorName = item.colorName;
    const noteText = `${category} - ${colorName}`;
    try {
      const updateResult = await updateClick(userId, category, colorName!);
      const isExistingNote = existingNotes.includes(noteText);
      const isAlreadySelected = selectedItems[category]?._id === item._id;
      const isUserItemMatch =
        allUserItems?.some(
          (userItem) =>
            userItem.category === category &&
            userItem.colorName &&
            userItem.colorName.toLowerCase() === colorName!.toLowerCase()
        ) ?? false;
      if (
        updateResult.suggest &&
        !isAlreadySelected &&
        !isExistingNote &&
        !isUserItemMatch
      ) {
        setNoteCandidate({ text: noteText });
      }
    } catch (err) {
      console.error("❌ Error saving click or getting clicks:", err);
    }
    setActiveCategory((prev) => (prev === category ? null : category));
  };
  
  const handleAddNote = async () => {
    if (!noteCandidate || !userId) return;

    try {
      await axios.post("/api/checklist", {
        userId,
        text: noteCandidate.text,
      });
      setExistingNotes((prev) => [...prev, noteCandidate.text]);
      setNoteCandidate(null);
    } catch (err) {
      console.error("❌ Error adding note:", err);
    }
  };

  const handleCancelNote = () => {
    setNoteCandidate(null);
  };

  const handleSelect = (category: string, item: ClothingItem) => {
    setSelectedItems((prev) => ({ ...prev, [category]: item }));
    setActiveCategory(null);
  };

  const buildNewLook = (): ClothingItem[] => {
    if (!look) return [];
    return look.items.reduce<ClothingItem[]>((acc, item) => {
      const selection = selectedItems[item.category];
      if (selection) acc.push(selection);
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

  return (
    <section className={styles.container}>
      <div className={styles.panelBody}>
        <div className={styles.lookRow}>
          {look.items.map((item) => (
            <button
              type="button"
              key={item._id}
              className={`${styles.lookImage} ${
                activeCategory === item.category ? styles.activeCategory : ""
              }`}
              onClick={() => handleCategoryClick(item)}
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

            {userItems[activeCategory] &&
            userItems[activeCategory].length > 0 ? (
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
                    aria-pressed={
                      selectedItems[activeCategory]?._id === userItem._id
                    }
                  >
                    <img
                      src={userItem.imageUrl}
                      alt={userItem.category}
                      loading="lazy"
                    />
                    <span>{userItem.style || userItem.category}</span>
                  </button>
                ))}
              </div>
            ) : (
              <p className={styles.emptyState}>
                No matching items found in this category. Try adding some to
                complete your look!
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
              <p className={styles.previewPlaceholder}>
                Start selecting pieces to see them here.
              </p>
            ) : (
              newLook.map((item, index) => (
                <div
                  key={item._id + "-" + index}
                  className={styles.previewItem}
                >
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
      {noteCandidate && (
        <div className={styles.notemodalOverlay}>
          <div className={styles.notemodal}>
            <p className={styles.notemodalText}>
              Add note for: <strong>{noteCandidate.text}</strong>?
            </p>
            <div className={styles.notemodalButtons}>
              <button className={styles.notebutton} onClick={handleAddNote}>
                Add Note
              </button>
              <button
                className={`${styles.notebutton} ${styles.notecancelButton}`}
                onClick={handleCancelNote}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
