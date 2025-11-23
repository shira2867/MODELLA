"use client";
import React, { useState, useEffect } from "react";
import styles from "./LookCard.module.css";
import { FiShare2, FiMail, FiMessageCircle, FiUpload } from "react-icons/fi";
import { FaFacebookF } from "react-icons/fa";
import { ClothingItem } from "@/types/clothTypes";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

type LookCardProps = {
  items: ClothingItem[];
  lookId?: string;
};

const LookCard: React.FC<LookCardProps> = ({ items, lookId }) => {
  const [isShared, setIsShared] = useState(false);
  const [sharedLookId, setSharedLookId] = useState<string | null>(null);

  const BASE_URL = typeof window !== "undefined" ? window.location.origin : "";
  const lookUrl = `${BASE_URL}/look/${lookId}`;
  const queryClient = useQueryClient();

  // -------------------------------
  // 1) CHECK IF LOOK IS SHARED
  // -------------------------------
  const { data: shareStatus } = useQuery({
    queryKey: ["shareLookStatus", lookId],
    queryFn: async () => {
      if (!lookId) return null;
      const res = await fetch(`/api/sharelook/${lookId}`);
      return res.json();
    },
    enabled: !!lookId,
    staleTime: Infinity,
  });

  useEffect(() => {
    if (!shareStatus) return;

    setIsShared(shareStatus.isShared);
    setSharedLookId(shareStatus.isShared ? shareStatus._id : null);
  }, [shareStatus]);

 
  const openPopup = (url: string) => {
    window.open(url, "_blank", "width=600,height=500,noopener,noreferrer");
  };

  const shareCopyLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(lookUrl);
    alert("Link copied!");
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
    openPopup(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(lookUrl)}`);
  };

  // -------------------------------
  // 2) ADD LOOK (POST)
  // -------------------------------
  const addLookMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/sharelook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lookId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not share look");
      return data;
    },
    onSuccess: (data) => {
      setIsShared(true);
      setSharedLookId(data._id);

      // חידוש הסטטוס
      queryClient.invalidateQueries({ queryKey: ["shareLookStatus", lookId] });

      alert("Look added to StyleFeed!");
    },
  });

  // -------------------------------
  // 3) REMOVE LOOK (DELETE)
  // -------------------------------
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

      // חידוש הסטטוס
      queryClient.invalidateQueries({ queryKey: ["shareLookStatus", lookId] });

      alert("Look removed from StyleFeed");
    },
  });

  // -------------------------------
  // UI
  // -------------------------------
  return (
    <div className={styles.card} style={{ cursor: "pointer" }}>
      <div className={styles.grid}>
        {items.map((item) => (
          <div key={item._id} className={styles.itemWrapper}>
            <img src={item.imageUrl} alt={item.category} className={styles.image} />
          </div>
        ))}
      </div>

      <div className={styles.shareButtons}>
        <button className={styles.shareButton} onClick={shareCopyLink}>
          <FiShare2 size={18} />
        </button>
        <button className={styles.shareButton} onClick={shareEmail}>
          <FiMail size={18} />
        </button>
        <button className={styles.shareButton} onClick={shareWhatsApp}>
          <FiMessageCircle size={18} />
        </button>
        <button className={styles.shareButton} onClick={shareFacebook}>
          <FaFacebookF size={18} />
        </button>

        {/* הכפתור שמשתנה לפי if shared */}
        {!isShared ? (
          <button
            className={`${styles.shareButton} ${styles.styleFeed}`}
            onClick={(e) => {
              e.stopPropagation();
              addLookMutation.mutate();
            }}
          >
            <FiUpload size={18} />
          </button>
        ) : (
          <button
            className={`${styles.shareButton} ${styles.styleFeed}`}
            onClick={(e) => {
              e.stopPropagation();
              removeLookMutation.mutate();
            }}
          >
            ✖
          </button>
        )}
      </div>
    </div>
  );
};

export default LookCard;
