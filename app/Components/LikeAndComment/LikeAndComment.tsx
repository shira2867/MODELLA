

"use client";
import { useState, useEffect } from "react";
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
    e.stopPropagation(); // מונע את onClick של הקלף
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
  className={`${styles.likeButton} ${likes.includes(userId) ? styles.liked : ""}`}
>
  <span className="icon">❤️</span>
  <span className="count">{likes?.length || 0}</span>
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
        console.log("Sending request for lookId:", lookId);

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
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="הוסף תגובה..."
        className={styles.commentInput}
        disabled={loading}
      />
      <button type="submit" className={styles.commentButton} disabled={loading}>
        {loading ? "שולח..." : "שלח"}
      </button>
    </form>
  );
}
