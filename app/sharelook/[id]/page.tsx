"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

import SharedLookCard from "../../Components/ShareLookCard/ShareLookCard";
import { LikeButton, CommentForm } from "../../Components/LikeAndComment/LikeAndComment";
import styles from "./shareLookId.module.css";

import { ShareLookType } from "@/types/shareLookType";

export default function ShareLookPage() {
  const params = useParams();
  const lookId = params?.id as string;
  const queryClient = useQueryClient();

  // USER ID מה-localStorage עם useEffect
  const [userId, setUserId] = useState<string | null>(null);
  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");
    setUserId(storedUserId);
  }, []);

  const { data: look, isLoading, refetch } = useQuery({
    queryKey: ["share-look", lookId],
    queryFn: async () => {
      const res = await axios.get(`/api/sharelook/${lookId}`);
      return res.data as ShareLookType;
    },
    enabled: !!lookId,
  });

  const addCommentToState = (comments: any[]) => {
    queryClient.setQueryData<ShareLookType>(["share-look", lookId], (old) => {
      if (!old) return old;
      return {
        ...old,
        comments,
      };
    });
  };

  if (!userId) return <p>Loading user…</p>;
  if (isLoading) return <p>Loading look…</p>;
  if (!look) return <p>Look not found</p>;

  return (
    <div className={styles.container}>
      {/* כרטיס הלוק */}
      <SharedLookCard look={look} />

      {/* לייקים */}
      <LikeButton
        lookId={look._id}
        userId={userId}
        likes={look.likes}
        onLike={() => refetch()}
      />

      {/* טופס תגובות */}
      <CommentForm
        lookId={look._id}
        userId={userId}
        onNewComment={addCommentToState}
      />

      {/* רשימת תגובות */}
      <ul className={styles.commentList}>
        {look.comments?.map((c, i) => (
          <li key={i} className={styles.commentItem}>
            <strong>{c.userId}</strong>: {c.text}
          </li>
        ))}
      </ul>
    </div>
  );
}
