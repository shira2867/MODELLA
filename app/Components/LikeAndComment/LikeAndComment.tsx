"use client";

import { useState, KeyboardEvent } from "react";
import type React from "react";
import axios from "axios";
import styles from "./LikeAndComment.module.css";
import Image from "next/image";

export function LikeButton({
  lookId,
  userId,
  likes,
  onLike,
}: {
  lookId: string;
  userId: string;
  likes: string[];
  onLike: (newLikes: string[]) => void;
}) {
  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!userId) {
      console.error("Missing userId");
      return;
    }

    try {
      const res = await axios.post(`/api/sharelook/${lookId}/like`, { userId });
      const updatedLikes = res.data.likes || [];
      onLike(updatedLikes);
    } catch (err) {
      console.error("Failed to like:", err);
    }
  };

  return (
    <button
      onClick={handleLike}
      className={`${styles.likeButton} ${
        userId && likes.includes(userId) ? styles.liked : ""
      }`}
    >
      <span className={styles.likeIcon}>❤️</span>
      <span className={styles.likeCount}>{likes?.length || 0}</span>
    </button>
  );
}

export function CommentForm({
  lookId,
  userId,
  userName,
  profileImage,
  onNewComment,
}: {
  lookId: string;
  userId: string;
  userName: string;
  profileImage?: string;
  onNewComment: (comments: any[]) => void;
}) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [emojiCategory, setEmojiCategory] = useState<"all" | "hearts" | "clothes">("all");

  const allEmojis = {
    all: ["😀", "😂", "😍", "😢", "😎", "👍", "💖", "🎉"],
    hearts: ["❤️", "💖", "💘", "💞", "💕"],
    clothes: ["👕", "👗", "👖", "🧥", "👟", "🥿", "🧢"],
  } as const;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    if (!text.trim()) return;

    setLoading(true);
    try {
      await axios.post(`/api/sharelook/${lookId}/comment`, {
        userId,
        userName,
        profileImage,
        text: text.trim(),
      });

      const res = await axios.get(`/api/sharelook/${lookId}/comment`);
      const comments = res.data.comments || [];
      onNewComment(comments);
      setText("");
      setShowEmojiPicker(false); 
    } catch (err) {
      console.error("Failed to add comment:", err);
    } finally {
      setLoading(false);
    }
  };

  const addEmoji = (emoji: string) => {
    setText((prev) => prev + emoji);
    setShowEmojiPicker(false); 
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      setShowEmojiPicker(false); 
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.commentForm}>
{profileImage ? (
  <Image
    src={profileImage}
    alt={userName}
    width={40}
    height={40}
    className={styles.commentAvatar}
    onError={(e) => {
      const target = e.target as HTMLImageElement;
      target.src = "/default-avatar.png"; 
    }}
  />
) : (
  <div className={styles.commentAvatarFallback}>
    {userName?.charAt(0).toUpperCase() || "U"}
  </div>
)}

      <div className={styles.commentInputWrapper}>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Add a comment..."
          className={styles.commentInput}
          disabled={loading}
        />

        <button
          type="button"
          className={styles.emojiButton}
          onClick={() => setShowEmojiPicker((prev) => !prev)}
        >
          😀
        </button>

     {showEmojiPicker && (
  <div className={styles.emojiPicker}>
    <div className={styles.emojiCategories}>
      <button
        type="button"
        onClick={() => setEmojiCategory("all")}
        className={emojiCategory === "all" ? styles.activeCategory : ""}
      >
        All
      </button>
      <button
        type="button"
        onClick={() => setEmojiCategory("hearts")}
        className={emojiCategory === "hearts" ? styles.activeCategory : ""}
      >
        Hearts
      </button>
      <button
        type="button"
        onClick={() => setEmojiCategory("clothes")}
        className={emojiCategory === "clothes" ? styles.activeCategory : ""}
      >
        Clothes
      </button>
    </div>

    <div className={styles.emojiGrid}>
      {allEmojis[emojiCategory].map((emoji) => (
        <button
          key={emoji}
          type="button"
          className={styles.emojiItem}
          onClick={() => addEmoji(emoji)}
        >
          {emoji}
        </button>
      ))}
    </div>
  </div>
)}

      </div>

      <button
        type="submit"
        className={styles.commentButton}
        disabled={loading}
      >
        {loading ? "Sending..." : "Send"}
      </button>
    </form>
  );
}
