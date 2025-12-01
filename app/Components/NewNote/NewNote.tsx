"use client";

import React, { useState, FC, useEffect } from "react";
import styles from "./NewNote.module.css";
import { ChecklistItem } from "../CheckList/CheckList";

type Props = {
  note?: ChecklistItem;
  onSave: (text: string) => void;
  onClose: () => void;
};

const NoteEditor: FC<Props> = ({ note, onSave, onClose }) => {
  const [text, setText] = useState(note?.text || "");

  useEffect(() => {
    setText(note?.text || "");
  }, [note]);

  return (
    <div className={styles.overlay}>
      <div className={styles.card}>
        <header className={styles.header}>
          <h2>{note ? "Edit Note" : "New Note"}</h2>
          <button className={styles.closeBtn} onClick={onClose}>
            ✕
          </button>
        </header>

        <textarea
          className={styles.textarea}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write your note here..."
        />

        <footer className={styles.footer}>
          <button
            className={styles.saveBtn}
            onClick={() => {
              if (!text.trim()) return alert("Please write something first!");
              onSave(text);
              setText("");
            }}
          >
            Save
          </button>
          <span className={styles.date}>{new Date().toLocaleDateString()}</span>
        </footer>
      </div>
    </div>
  );
};

export default NoteEditor;
