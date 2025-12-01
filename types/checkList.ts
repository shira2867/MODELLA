export type ChecklistItem = {
  _id: string;
  userId: string;
  text: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ChecklistItemPayload = {
  userId: string;
  text: string;
};
