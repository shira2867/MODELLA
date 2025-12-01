"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import styles from "./CheckList.module.css";
import NoteEditor from "../NewNote/NewNote";
import { FaEdit, FaTrash, FaCheckCircle, FaUndo } from "react-icons/fa";

export type ChecklistItem = {
  _id: string;
  userId: string;
  text: string;
  completed: boolean;
  createdAt?: string;
};

type Props = {
  userId: string;
};

export default function CheckList({ userId }: Props) {
  const queryClient = useQueryClient();
  const [editingNote, setEditingNote] = useState<ChecklistItem | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  const { data: items = [], isLoading } = useQuery<ChecklistItem[]>({
    queryKey: ["checklist", userId],
    queryFn: async () => {
      const res = await axios.get(`/api/checklist?userId=${userId}`);
      return res.data;
    },
  });

  const addMutation = useMutation({
    mutationFn: async (text: string) => {
      const res = await axios.post(`/api/checklist`, { userId, text });
      return {
        ...res.data,
        text,
        completed: false,
        userId,
        createdAt: new Date().toISOString(),
      };
    },
    onSuccess: (newItem) => {
      queryClient.setQueryData<ChecklistItem[]>(
        ["checklist", userId],
        (old = []) => [...old, newItem]
      );
      setIsEditorOpen(false);
    },
  });

  const toggleMutation = useMutation({
    mutationFn: async ({
      id,
      completed,
      text,
    }: {
      id: string;
      completed: boolean;
      text: string;
    }) => {
      await axios.put(`/api/checklist`, {
        id: id,
        completed: !completed,
        text: text,
      });
      return id;
    },
    onSuccess: (id) => {
      queryClient.setQueryData<ChecklistItem[]>(
        ["checklist", userId],
        (old = []) =>
          old.map((item) =>
            item._id === id ? { ...item, completed: !item.completed } : item
          )
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await axios.delete(`/api/checklist?id=${id}`);
      return id;
    },
    onSuccess: (id) => {
      queryClient.setQueryData<ChecklistItem[]>(
        ["checklist", userId],
        (old = []) => old.filter((item) => item._id !== id)
      );
    },
  });

  const openEditor = (note?: ChecklistItem) => {
    setEditingNote(note || null);
    setIsEditorOpen(true);
  };

  const handleSave = (text: string) => {
    if (editingNote) {
      axios
        .put(`/api/checklist`, { id: editingNote._id, text: text })
        .then(() => {
          queryClient.invalidateQueries(["checklist", userId]);
          setIsEditorOpen(false);
        })
        .catch((err) => alert("Error updating note: " + err.message));
    } else {
      addMutation.mutate(text);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.mainContent}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "1.5rem",
            width: "100%",
            maxWidth: "1260px",
            padding: "0 1rem",
          }}
        >
                   {" "}
          <h2
            style={{
              fontFamily: "Playfair Display, Georgia, serif",
              fontSize: "1.75rem",
              color: "var(--color-text)",
            }}
          >
                        My Notes          {" "}
          </h2>
                   {" "}
          <button
            className={styles.deleteButton}
            onClick={() => openEditor()}
            style={{
              padding: "0.65rem 1.25rem",
              background: "#5c1a1a",
              color: "#fff",
              boxShadow: "0 8px 18px rgba(92, 26, 26, 0.3)",
            }}
          >
                        ➕ New Note          {" "}
          </button>
        </div>
        <div className={styles.closetContent}>
          {isLoading ? (
            <p className={styles.loading}>Loading notes...</p>
          ) : items.length === 0 ? (
            <p className={styles.noClothes}>
              No notes found. Click "New Note" to add one!
            </p>
          ) : (
            <div className={styles.cardsWrapper}>
              {items.map((item) => (
                <div key={item._id} className={styles.card}>
                  <div
                    className={styles.imageWrapper}
                    style={{ aspectRatio: "unset", minHeight: "150px" }}
                  >
                    <p
                      style={{
                        padding: "1rem",
                        whiteSpace: "pre-wrap",
                        fontFamily: "inherit",
                        fontSize: "1rem",
                        color: item.completed
                          ? "var(--color-text-muted)"
                          : "var(--color-text)",
                        textDecoration: item.completed
                          ? "line-through"
                          : "none",
                      }}
                    >
                      {item.text}
                    </p>
                  </div>

                  <span
                    style={{
                      fontSize: "0.8rem",
                      color: "var(--color-text-muted)",
                      textAlign: "center",
                      marginBottom: "0.75rem",
                    }}
                  >
                    {item.createdAt
                      ? new Date(item.createdAt).toLocaleDateString()
                      : "No Date"}
                  </span>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-around",
                      alignItems: "center",
                      padding: "0 0.5rem",
                      borderTop: "1px solid var(--color-border)",
                    }}
                  >
                    <button
                      className={`${styles.iconButton} ${styles.delete}`}
                      onClick={() => deleteMutation.mutate(item._id)}
                      title="Delete"
                    >
                      <FaTrash />
                    </button>

                    <button
                      className={styles.iconButton}
                      onClick={() => openEditor(item)}
                      title="Edit"
                      style={{
                        opacity: item.completed ? 0.3 : 1,
                        cursor: item.completed ? "not-allowed" : "pointer",
                      }}
                    >
                      <FaEdit />
                    </button>

                    <button
                      className={`${styles.iconButton} ${styles.done}`}
                      onClick={() =>
                        toggleMutation.mutate({
                          id: item._id,
                          completed: item.completed,
                          text: item.text,
                        })
                      }
                      title={item.completed ? "Undo" : "Done"}
                      style={{ color: item.completed ? "#5cb85c" : "#888" }}
                    >
                      {item.completed ? <FaUndo /> : <FaCheckCircle />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        {isEditorOpen && (
          <NoteEditor
            note={editingNote || undefined}
            onSave={handleSave}
            onClose={() => setIsEditorOpen(false)}
          />
        )}{" "}
      </div>
    </div>
  );
}
