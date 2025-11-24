import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import styles from "./DeleteHandleLooksModal.module.css";
import { LookType as Look } from "@/types/lookTypes";

type Props = {
  clothingId: string;
  open: boolean;
  onClose: () => void;
  onComplete: (result: { updated: string[]; deleted: string[] }) => void;
};

type MutationResponse = {
  updatedLooks: string[];
  deletedLooks: string[];
};

type MutationVariables = {
  lookId: string;
  action: "update" | "delete";
}[];

const fetchLooks = async (clothingId: string): Promise<Look[]> => {
  const res = await axios.get(
    `/api/clothing/delete-and-handle-looks?id=${clothingId}`
  );
  return res.data.looks ?? [];
};

const DeleteHandleLooksModal: React.FC<Props> = ({
  clothingId,
  open,
  onClose,
  onComplete,
}) => {
  const queryClient = useQueryClient();
  const [actions, setActions] = useState<Record<string, "update" | "delete">>(
    {}
  );

  const { data: looks = [], isLoading } = useQuery<Look[], Error>({
    queryKey: ["looks", clothingId],
    queryFn: () => fetchLooks(clothingId),
    enabled: open,
  });

  useEffect(() => {
    if (!looks || looks.length === 0) return;

    setActions((prev) => {
      const newActions: Record<string, "update" | "delete"> = {};
      looks.forEach((l) => (newActions[l._id] = prev[l._id] ?? "update"));

      const same =
        Object.keys(newActions).length === Object.keys(prev).length &&
        Object.keys(newActions).every((key) => newActions[key] === prev[key]);

      return same ? prev : newActions;
    });
  }, [looks]);

  const mutation = useMutation<MutationResponse, Error, MutationVariables>({
    mutationFn: (actionPerLook) =>
      axios
        .post("/api/clothing/delete-and-handle-looks", {
          clothingId,
          actionPerLook,
        })
        .then((res) => res.data),
    onSuccess: (data) => {
      onComplete({
        updated: data.updatedLooks ?? [],
        deleted: data.deletedLooks ?? [],
      });
      queryClient.invalidateQueries({ queryKey: ["looks", clothingId] });
      queryClient.invalidateQueries({ queryKey: ["closet"] });
      queryClient.invalidateQueries({ queryKey: ["myLooks"] });
      queryClient.invalidateQueries({ queryKey: ["clothing", clothingId] });

      onClose();
    },
    onError: () => alert("Error processing. Try again."),
  });

  const handleActionChange = (lookId: string, action: "update" | "delete") => {
    setActions((prev) => ({ ...prev, [lookId]: action }));
  };

  const handleConfirm = () => {
    const actionPerLook = Object.entries(actions).map(([lookId, action]) => ({
      lookId,
      action,
    }));
    mutation.mutate(actionPerLook);
  };

  if (!open) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h2>Item is used in these looks</h2>

        {isLoading ? (
          <p>Loading related looks...</p>
        ) : looks.length === 0 ? (
          <p>
            This item isn't used in any look. Are you sure you want to delete
            it?
          </p>
        ) : (
          <div className={styles.looksContainer}>
            {looks.map((look) => (
              <div key={look._id} className={styles.lookCard}>
                <div className={styles.lookGrid}>
                  {look.items.map((item) => (
                    <div key={item._id} className={styles.itemWrapper}>
                      <img
                        src={item.imageUrl}
                        alt={item.category}
                        className={styles.image}
                      />
                    </div>
                  ))}
                </div>
                <select
                  className={styles.select}
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
            ))}
          </div>
        )}

        <div className={styles.modalActions}>
          <button
            className={styles.confirmButton}
            onClick={handleConfirm}
            disabled={mutation.isPending} 
          >
            {mutation.isPending ? "Processing..." : "Confirm"}
          </button>
          <button
            className={styles.cancelButton}
            onClick={onClose}
            disabled={mutation.isPending}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteHandleLooksModal;
