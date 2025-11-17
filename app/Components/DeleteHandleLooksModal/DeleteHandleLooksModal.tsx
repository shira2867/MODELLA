"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import styles from "./DeleteHandleLooksModal.module.css";

type Look = {
  _id: string;
  imageUrl?: string;
  // items אפשרי, לא צריך פה
};

type Props = {
  clothingId: string;
  open: boolean;
  onClose: () => void;
  onComplete: (result: { updated: string[]; deleted: string[] }) => void;
};

const DeleteHandleLooksModal: React.FC<Props> = ({
  clothingId,
  open,
  onClose,
  onComplete,
}) => {
  const [looks, setLooks] = useState<Look[]>([]);
  const [actions, setActions] = useState<Record<string, "update" | "delete">>(
    {}
  );
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!open) return;
    const fetchRelated = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`/api/clothing?id=${clothingId}`);
        const lookNames: string[] = res.data.lookNames ?? [];
        // מביאים מבנים פשוטים לצורך הצגה — server מחזיר רק ה־_id של הלוקים
        const tmpLooks = lookNames.map((id) => ({ _id: id }));
        setLooks(tmpLooks);
        // ברירת מחדל לכל לוק: להסיר את הפריט מהלוק (update)
        const defaultActions: Record<string, "update" | "delete"> = {};
        tmpLooks.forEach((l) => (defaultActions[l._id] = "update"));
        setActions(defaultActions);
      } catch (err) {
        console.error("Error fetching related looks:", err);
        setLooks([]);
      } finally {
        setLoading(false);
      }
    };
    fetchRelated();
  }, [open, clothingId]);

  const handleActionChange = (lookId: string, action: "update" | "delete") => {
    setActions((prev) => ({ ...prev, [lookId]: action }));
  };

  const handleConfirm = async () => {
    setProcessing(true);
    try {
      const actionPerLook = Object.entries(actions).map(([lookId, action]) => ({
        lookId,
        action,
      }));
      // שולחים לכל השרת — גם אם אין לוקים, נחזיר רשימת פעולות ריקה והשרת ימחק את הפריט
      const res = await axios.post(`/api/clothing/delete-and-handle-looks`, {
        clothingId,
        actionPerLook,
      });
      const updated = res.data.updatedLooks ?? [];
      const deleted = res.data.deletedLooks ?? [];
      onComplete({ updated, deleted });
      onClose();
    } catch (err) {
      console.error("Error processing delete/update:", err);
      alert("Error processing. Try again.");
    } finally {
      setProcessing(false);
    }
  };

  if (!open) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h2>Item is used in these looks</h2>

        {loading ? (
          <p>Loading related looks...</p>
        ) : looks.length === 0 ? (
          <>
            <p>
              This item isn't used in any look. Are you sure you want to delete
              it?
            </p>
          </>
        ) : (
          <>
            <p>Choose what to do for each look:</p>
            <ul className={styles.lookList}>
              {looks.map((look) => (
                <li key={look._id} className={styles.lookItem}>
                  <div>
                    <strong>{look._id}</strong>
                  </div>
                  <div>
                    <select
                      value={actions[look._id]}
                      onChange={(e) =>
                        handleActionChange(
                          look._id,
                          e.target.value as "update" | "delete"
                        )
                      }
                    >
                      <option value="update">Remove item from look</option>
                      <option value="delete">Delete entire look</option>
                    </select>
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}

        <div className={styles.modalActions}>
          <button
            className={styles.confirmButton}
            onClick={handleConfirm}
            disabled={processing}
          >
            {processing ? "Processing..." : "Confirm"}
          </button>
          <button
            className={styles.cancelButton}
            onClick={onClose}
            disabled={processing}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteHandleLooksModal;
