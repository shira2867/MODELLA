import React, { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import styles from "./DeleteHandleLooksModal.module.css";
import { LookType as Look } from "@/types/lookTypes";

type Props = {
  clothingId: string;
  open: boolean;
  onClose: () => void;
  onComplete: (result: { updated: string[]; deleted: string[] }) => void;
  itemImageUrl?: string;
  itemCategory?: string;
  userId: string;
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
  itemImageUrl,
  itemCategory,
  userId,
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
      queryClient.invalidateQueries({ queryKey: ["clothes", userId] });
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

  const previewImageUrl = useMemo(() => {
    if (itemImageUrl) return itemImageUrl;
    if (!looks || looks.length === 0) return itemImageUrl ?? null;

    const containingLook = looks.find((look) =>
      look.items.some((item) => item._id === clothingId)
    );

    const matchedItem = containingLook?.items.find(
      (item) => item._id === clothingId
    );

    if (matchedItem?.imageUrl) return matchedItem.imageUrl;

    const firstItem = looks[0]?.items[0];
    return firstItem?.imageUrl ?? itemImageUrl ?? null;
  }, [looks, clothingId, itemImageUrl]);

  return (
    <div className={styles.modalOverlay} role="presentation">
      <div
        className={styles.modalContent}
        role="dialog"
        aria-modal="true"
        aria-label="Delete or update looks"
      >
        <h2>Confirm deletion</h2>
        <div className={styles.previewSection}>
          <div className={styles.previewImageFrame}>
            {previewImageUrl ? (
              <img
                src={previewImageUrl}
                alt={itemCategory || "Selected closet item"}
                className={styles.previewImage}
              />
            ) : (
              <span className={styles.previewFallback}>
                No preview available
              </span>
            )}
          </div>
          <div className={styles.previewCopy}>
            <p>This is the item you are about to delete.</p>
            <p className={styles.previewSubcopy}>
              Review each look below and decide how it should be handled.
            </p>
          </div>
        </div>

        {isLoading ? (
          <p>Loading related looks...</p>
        ) : looks.length === 0 ? (
          <div className={styles.emptyState}>
            <p>This item isn't used in any look.</p>
            <p>Click confirm below to permanently delete it.</p>
          </div>
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

                <div className={styles.checkboxGroup} role="group">
                  <label
                    className={`${styles.checkboxOption} ${
                      actions[look._id] === "update"
                        ? styles.checkboxOptionActive
                        : ""
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={actions[look._id] === "update"}
                      onChange={() => handleActionChange(look._id, "update")}
                      aria-label="Remove item from look"
                    />
                    <div className={styles.checkboxCopy}>
                      <span>Remove item from look</span>
                      <small>Keep the look but take this item out of it.</small>
                    </div>
                  </label>
                  <label
                    className={`${styles.checkboxOption} ${
                      actions[look._id] === "delete"
                        ? styles.checkboxOptionActive
                        : ""
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={actions[look._id] === "delete"}
                      onChange={() => handleActionChange(look._id, "delete")}
                      aria-label="Delete entire look"
                    />
                    <div className={styles.checkboxCopy}>
                      <span>Delete entire look</span>
                      <small>
                        Permanently remove the entire look from your closet.
                      </small>
                    </div>
                  </label>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className={styles.modalActions}>
          <button
            type="button"
            className={styles.confirmButton}
            onClick={handleConfirm}
            disabled={mutation.isPending}
          >
            {mutation.isPending ? "Processing..." : "Confirm"}
          </button>
          <button
            type="button"
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
