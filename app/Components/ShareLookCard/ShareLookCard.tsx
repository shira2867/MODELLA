"use client";
import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import styles from "./ShareLookCard.module.css";
import { ShareLookType } from "@/types/shareLookType";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";

export function LikeButton({
  lookId,
  userId,
  likes,
  onLike,
}: {
  lookId: string;
  userId: string;
  likes: string[];
  onLike: () => void;
}) {
  const handleLike = async () => {
    try {
      await axios.post(`/api/sharelook/${lookId}/like`, { userId });
      onLike();
    } catch (err) {
      console.error("Failed to like:", err);
    }
  };

  return (
    <button onClick={handleLike} className={styles.likeButton}>
      ❤️ {likes ? likes.length : 0}
    </button>
  );
}

export function CommentForm({
  lookId,
  userId,
  onNewComment,
}: {
  lookId: string;
  userId: string;
  onNewComment: (comments: any) => void;
}) {
  const [text, setText] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await axios.post(`/api/sharelook/${lookId}/comment`, {
        userId,
        text,
      });
      onNewComment(res.data.comments);
      setText("");
    } catch (err) {
      console.error("Failed to add comment:", err);
    }
  };

  return (
    
    <form onSubmit={handleSubmit} className={styles.commentForm}>
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="הוסף תגובה..."
        className={styles.commentInput}
      />
      <button type="submit" className={styles.commentButton}>
        שלח
      </button>
    </form>
  );
}

type Props = {
  look: ShareLookType;
};

export default function SharedLookCard({ look }: Props) {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/sharelook/${look._id}`);
  };

  return (
   <div className={styles.container}>
   

    <div className={styles.card} onClick={handleClick}>
      <div className={styles.grid}>
        {look.items?.map((item, index) => (
          <div key={item._id || index} className={styles.itemWrapper}>
            <img
              className={styles.image}
              src={item.imageUrl}
              alt={item.category || "item"}
            />
          </div>
        ))}
      </div>

      <div className={styles.info}>
        ❤️ {look.likes ? look.likes.length : 0}
      </div>
    </div>
    </div> 
  );
}
