"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";
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
  const [expandedNoteId, setExpandedNoteId] = useState<string | null>(null);

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
      await axios.put(`/api/checklist`, { id, completed: !completed, text });
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
        .put(`/api/checklist`, { id: editingNote._id, text })
        .then(() => {
          queryClient.invalidateQueries({ queryKey: ["checklist", userId] });
          setIsEditorOpen(false);
        })
        .catch((err) => alert("Error updating note: " + err.message));
    } else {
      addMutation.mutate(text);
    }
  };

  const truncateText = (text: string, limit = 100) => {
    if (text.length <= limit) return text;
    return text.slice(0, limit) + "...";
  };

  return (
    <div className={styles.container}>
      <Header />{" "}
      <div className={styles.pageWrapper}>
        {" "}
        <button
          className={`${styles.ctaButton} ${styles.primaryCta}`}
          onClick={() => openEditor()}
        >
          Create New Note{" "}
        </button>{" "}
        <div className={styles.cardsWrapper}>
          {items.map((item) => (
            <div key={item._id} className={styles.noteHangerWrapper}>
              <div className={styles.hangerContainer}>
                <img
                  src="/e09956b6-4cd9-4d2b-aac5-7f0cb1fd7aba-removebg-preview.png"
                  alt="Clothes Hanger"
                  className={styles.hangerImage}
                />
              </div>
              <div
                className={`${styles.introCard} ${
                  item.completed ? styles.completedCard : ""
                } ${expandedNoteId === item._id ? styles.expanded : ""}`}
                onClick={() =>
                  setExpandedNoteId(
                    expandedNoteId === item._id ? null : item._id
                  )
                }
              >
                <div className={styles.introContent}>
                  <p
                    className={styles.cardTitle}
                    style={{
                      textDecoration: item.completed ? "line-through" : "none",
                    }}
                  >
                    {expandedNoteId === item._id
                      ? item.text
                      : truncateText(item.text)}
                  </p>

                  <p className={styles.cardEyebrow}>
                    {item.createdAt
                      ? new Date(item.createdAt).toLocaleDateString()
                      : "No Date"}
                  </p>
                </div>

                <div className={styles.iconActions}>
                  <button
                    className={styles.iconButton}
                    onClick={(e) => {
                      e.stopPropagation();
                      openEditor(item);
                    }}
                    title="Edit"
                  >
                    <FaEdit />
                  </button>
                  <button
                    className={styles.iconButton}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleMutation.mutate({
                        id: item._id,
                        completed: item.completed,
                        text: item.text,
                      });
                    }}
                    title={item.completed ? "Undo" : "Done"}
                  >
                    {item.completed ? <FaUndo /> : <FaCheckCircle />}
                  </button>
                  <button
                    className={styles.iconButton}
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteMutation.mutate(item._id);
                    }}
                    title="Delete"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>{" "}
        {isEditorOpen && (
          <NoteEditor
            note={editingNote || undefined}
            onSave={handleSave}
            onClose={() => setIsEditorOpen(false)}
          />
        )}
        {" "}
      </div>
       <Footer />{" "}
    </div>
  );
}
