export type ClothingItem = {
  _id: string;
  userId: string;
  imageUrl: string;
  category: string;
  colorName?: string;
  color?: string;
  thickness?: "light" | "medium" | "heavy" | " ";
  style?: string;
};

export type ClothingItemPayload = {
  userId: string;
  category: string;
  thickness: "light" | "medium" | "heavy" | " ";
  style: string;
  imageUrl: string;
  color: string;
  colorName: string;
};
