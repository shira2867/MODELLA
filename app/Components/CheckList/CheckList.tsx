"use client";

import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import styles from "./CheckList.module.css";
import NoteEditor from "../NewNote/NewNote";
import { FaEdit, FaTrash, FaCheckCircle, FaUndo, FaThumbtack } from "react-icons/fa"; 

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

const getRandomRotation = (): string => {
  const min = -2;
  const max = 2;
  return `${Math.random() * (max - min) + min}deg`;
};

export default function CheckList({ userId }: Props) {
  const queryClient = useQueryClient();
  const [editingNote, setEditingNote] = useState<ChecklistItem | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [expandedNoteId, setExpandedNoteId] = useState<string | null>(null);

  const { data: fetchedItems = [], isLoading } = useQuery<ChecklistItem[]>({
    queryKey: ["checklist", userId],
    queryFn: async () => {
      const res = await axios.get(`/api/checklist?userId=${userId}`);
      return res.data;
    },
  });

  // **שינוי: מיון הפריטים - הלא-מושלמים (completed: false) ראשונים**
  const items = useMemo(() => {
    // מיון: אם completed זה false זה -1 (יופיע ראשון), אם true זה 1 (יופיע אחרון).
    return [...fetchedItems].sort((a, b) => (a.completed === b.completed ? 0 : a.completed ? 1 : -1));
  }, [fetchedItems]);


  // **שמירת ההטיה הקבועה לכל פתק**
  const rotations = useMemo(() => {
    const rotationMap: { [key: string]: string } = {};
    fetchedItems.forEach(item => { // שימוש ב-fetchedItems למניעת שינוי סיבוב במיון
      rotationMap[item._id] = getRandomRotation();
    });
    return rotationMap;
  }, [fetchedItems]);

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

  const truncateText = (text: string) => text;


  return (
    <div className={styles.container}>
      <Header />{" "}
      <div className={styles.pageWrapper}>

        <button
          className={`${styles.ctaButton} ${styles.primaryCta}`}
          onClick={() => openEditor()}
        >
          Create New Note + {" "}
        </button>{" "}

        <div className={styles.cardsWrapper}>
          {items.map((item) => (
            <div key={item._id} className={styles.noteCardWrapper}>
              
              {/* **שינוי: הוספת סיכת הנעוץ** */}
              <div className={styles.notePin}>
                <FaThumbtack />
              </div>

              <div
                className={`${styles.introCard} ${item.completed ? styles.completedCard : ""
                  }`}
                style={{ '--rotation': rotations[item._id] || '0deg' } as React.CSSProperties}
                onClick={() => setExpandedNoteId(null)}
              >
                <div className={styles.introContent}>
                  <p
                    className={styles.cardTitle}
                    style={{
                      textDecoration: item.completed ? "line-through" : "none",
                    }}
                  >
                    {item.text}
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