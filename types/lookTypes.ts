import { ClothingItem } from "@/types/clothTypes";

export type LookType = {
  _id: string;
  userId: string;
  items: ClothingItem[];
  createdAt?: Date;
};