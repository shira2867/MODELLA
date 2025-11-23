"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import axios from "axios";

import SharedLookCard, { LikeButton, CommentForm } from "../../Components/ShareLookCard/ShareLookCard";
import styles from "./shareLookId.module.css";

import { ShareLookType } from "@/types/shareLookType";

export default function ShareLookPage() {
  const params = useParams();
  const lookId = params?.id as string;

  const [look, setLook] = useState<ShareLookType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!lookId) return;

    const fetchLook = async () => {
      try {
        const res = await axios.get(`/api/sharelook/${lookId}`);
        setLook(res.data);
      } catch (err) {
        console.error("Failed to fetch shared look:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLook();
  }, [lookId]);

  if (loading) return <p>Loading...</p>;
  if (!look) return <p>Look not found</p>;

  const refreshLook = async () => {
    try {
      const res = await axios.get(`/api/sharelook/${lookId}`);
      setLook(res.data);
    } catch (err) {
      console.error("Failed to refresh look:", err);
    }
  };

  const addCommentToState = (comment: any) => {
    setLook((prev) =>
      prev ? { ...prev, comments: [...prev.comments, comment] } : prev
    );
  };

  return (
    <div className={styles.container}>
      <SharedLookCard look={look} />

      <LikeButton
        lookId={look._id}
        userId={"691099dc7b40612d2eceb701"}
        likes={look.likes}
        onLike={refreshLook}
      />

      <CommentForm
        lookId={look._id}
        userId={"691099dc7b40612d2eceb701"}
        onNewComment={addCommentToState}
      />

      <ul className={styles.commentList}>
        {look.comments.map((c, i) => (
          <li key={i} className={styles.commentItem}>
            <strong>{c.userId}</strong>: {c.comment}
          </li>
        ))}
      </ul>
    </div>
  );
}
