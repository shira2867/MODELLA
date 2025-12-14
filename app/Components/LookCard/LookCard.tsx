
"use client";
import React, { useState, useEffect } from "react";
import styles from "./LookCard.module.css";
import { useToast } from "../Toast/ToastProvider";
import { FiShare2, FiMail, FiMessageCircle, FiUpload } from "react-icons/fi";
import { FaFacebookF, FaTimes, FaTrash } from "react-icons/fa";
import { ClothingItem } from "@/types/clothTypes";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useUserStore } from "@/store/userStore";

type LookCardProps = {
  items: ClothingItem[];
  lookId?: string;
};

const LookCard: React.FC<LookCardProps> = ({ items, lookId }) => {
  const [isShared, setIsShared] = useState(false);
  const [sharedLookId, setSharedLookId] = useState<string | null>(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);
  const queryClient = useQueryClient();
  const userId = useUserStore((state) => state.userId);
  const profileImage = useUserStore((state) => state.user?.profileImage);
  const { showToast } = useToast();

  const BASE_URL = globalThis?.location?.origin ?? "";
  const lookUrl = `${BASE_URL}/sharelookpersonal/${lookId}`;

  const { data: shareStatus } = useQuery({
    queryKey: ["shareLookStatus", lookId],
    queryFn: async () => {
      if (!lookId || !userId) return null;
      const res = await fetch(`/api/sharelook/${lookId}`);
      return res.json();
    },
    enabled: !!lookId && !!userId,
    staleTime: Infinity,
  });

  useEffect(() => {
    if (shareStatus) {
      setIsShared(shareStatus.isShared);
      setSharedLookId(shareStatus.isShared ? shareStatus._id : null);
    }
  }, [shareStatus]);

  const openPopup = (url: string) => {
    if (typeof globalThis === "undefined" || typeof globalThis.open !== "function")
      return;
    globalThis.open(url, "_blank", "width=600,height=500,noopener,noreferrer");
  };

  const shareCopyLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard?.writeText(lookUrl);
    showToast("Link copied!", "success");
  };

  const shareEmail = (e: React.MouseEvent) => {
    e.stopPropagation();
    openPopup(`mailto:?subject=Check out this look&body=${lookUrl}`);
  };

  const shareWhatsApp = (e: React.MouseEvent) => {
    e.stopPropagation();
    openPopup(`https://wa.me/?text=${encodeURIComponent(lookUrl)}`);
  };

  const shareFacebook = (e: React.MouseEvent) => {
    e.stopPropagation();
    openPopup(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
        lookUrl
      )}`
    );
  };

  const addLookMutation = useMutation({
    mutationFn: async () => {
      if (!userId || !lookId) throw new Error("Missing userId or lookId");
      const res = await fetch("/api/sharelook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lookId, userId, profileImage }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not share look");
      return data;
    },
    onSuccess: (data) => {
      setIsShared(true);
      setSharedLookId(data._id);
      queryClient.invalidateQueries({ queryKey: ["shareLookStatus", lookId] });
      showToast("Look added to StyleFeed!", "success");
    },
  });

  const removeLookMutation = useMutation({
    mutationFn: async () => {
      if (!sharedLookId) throw new Error("Missing shared look ID");
      const res = await fetch(`/api/sharelook/${sharedLookId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not remove");
      return data;
    },
    onSuccess: () => {
      setIsShared(false);
      setSharedLookId(null);
      queryClient.invalidateQueries({ queryKey: ["shareLookStatus", lookId] });
      showToast("Look removed from StyleFeed", "success");
    },
    onError: (err: any) =>
      showToast(err.message || "Could not remove look", "error"),
  });

  const deleteLook = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!lookId || !userId) return;
    if (!confirm("Are you sure you want to delete this look?")) return;

    try {
      const res = await fetch(`/api/looks/${lookId}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete look");
      setIsDeleted(true);
      queryClient.invalidateQueries({ queryKey: ["userLooks", userId] });
      setIsPopupOpen(false);
      showToast("Look deleted successfully!", "success");
    } catch (err: any) {
      showToast(err.message || "Failed to delete look", "error");
    }
  };

  if (isDeleted) return null;

  const closePreview = () => setIsPopupOpen(false);
  const togglePreview = () => setIsPopupOpen(true);

  return (
    <article className={styles.card} data-shared={isShared}>
      <header className={styles.cardHeader}>
        <div className={styles.cardSummary}>
          <p className={styles.cardEyebrow}>Look</p>
          <h3 className={styles.cardTitle}>{items.length} curated items</h3>
          <p className={styles.cardHelper}>Tap any piece for a full-screen preview.</p>
        </div>
        <span
          className={`${styles.badge} ${isShared ? styles.badgeSuccess : ""}`}
          aria-live="polite"
        >
          {isShared ? "Shared to StyleFeed" : "Private look"}
        </span>
      </header>

      <div className={styles.cardBody}>
        <ul className={styles.grid} aria-label="Look items">
          {items.map((item) => (
            <li key={item._id}>
              <button
                className={styles.itemWrapper}
                onClick={togglePreview}
                type="button"
                aria-label={`Preview ${item.category}`}
              >
                <img
                  src={item.imageUrl}
                  alt={item.category}
                  className={styles.image}
                  loading="lazy"
                />
              </button>
            </li>
          ))}
        </ul>
      </div>

      <footer className={styles.cardFooter}>
        <div>
          <p className={styles.shareLabel}>Share or manage look</p>
          <p className={styles.shareDescription}>
            Copy a link or push to StyleFeed. Removing will hide it from followers.
          </p>
        </div>
        <div className={styles.shareButtons} aria-label="Share look options">
          <button type="button" className={styles.shareButton} onClick={shareCopyLink} title="Copy share link">
            <FiShare2 size={18} />
          </button>
          <button type="button" className={styles.shareButton} onClick={shareEmail} title="Share via email">
            <FiMail size={18} />
          </button>
          <button type="button" className={styles.shareButton} onClick={shareWhatsApp} title="Share via WhatsApp">
            <FiMessageCircle size={18} />
          </button>
          <button type="button" className={styles.shareButton} onClick={shareFacebook} title="Share on Facebook">
            <FaFacebookF size={18} />
          </button>

          {isShared ? (
            <button
              type="button"
              className={`${styles.shareButton} ${styles.styleFeed}`}
              onClick={(e) => { e.stopPropagation(); removeLookMutation.mutate(); }}
              title="Remove from StyleFeed"
            >
              ✖
            </button>
          ) : (
            <button
              type="button"
              className={`${styles.shareButton} ${styles.styleFeed}`}
              onClick={(e) => { e.stopPropagation(); addLookMutation.mutate(); }}
              title="Share to StyleFeed"
            >
              <FiUpload size={18} />
            </button>
          )}

          {lookId && (
            <button
              type="button"
              className={`${styles.shareButton} ${styles.deleteButton}`}
              onClick={deleteLook}
              title="Delete look"
            >
              <FaTrash size={18} />
            </button>
          )}
        </div>
      </footer>

      {isPopupOpen && (
        <div className={styles.modalBackdrop}>
          <button className={styles.backdropDismiss} onClick={closePreview} tabIndex={-1} />
          <dialog open className={styles.modalContentLarge} onCancel={(e) => { e.preventDefault(); closePreview(); }}>
            <button type="button" className={styles.closeButton} onClick={closePreview}>
              <FaTimes />
            </button>
            <header className={styles.modalHeader}>
              <p className={styles.cardEyebrow}>Full look</p>
              <h4 className={styles.modalTitle}>{items.length} curated items</h4>
              <p className={styles.modalDescription}>Scroll through every piece in a larger canvas to examine textures and fit.</p>
            </header>
            <div className={styles.gridLarge}>
              {items.map((item) => (
                <div key={item._id} className={styles.itemWrapperLarge}>
                  <img src={item.imageUrl} alt={item.category} className={styles.imageLarge} loading="lazy" />
                </div>
              ))}
            </div>
          </dialog>
        </div>
      )}
    </article>
  );
};

export default LookCard;
