"use client";

import { useState } from "react";
import type React from "react";
import axios from "axios";
import styles from "./LikeAndComment.module.css";

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
    // Prevents the card's onClick from firing
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userId) {
      console.error("Missing userId");
      return;
    }
    if (!text.trim()) {
      console.error("Empty comment text");
      return;
    }

    setLoading(true);
    try {
      console.log("Sending request for lookId:", lookId);

      await axios.post(`/api/sharelook/${lookId}/comment`, {
        userId,
        userName,
        text: text.trim(),
      });

      const res = await axios.get(`/api/sharelook/${lookId}/comment`);
      const comments = res.data.comments || [];
      console.log("GET comments response:", res.data);

      onNewComment(comments);
      setText("");
    } catch (err) {
      console.error("Failed to add comment:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.commentForm}>
      {/* Small user avatar next to the input */}
      {profileImage ? (
        <img
          src={profileImage}
          alt={userName}
          className={styles.commentAvatar}
        />
      ) : (
        <div className={styles.commentAvatarFallback}>
          {userName?.charAt(0).toUpperCase() || "U"}
        </div>
      )}

      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Add a comment..."
        className={styles.commentInput}
        disabled={loading}
      />

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
