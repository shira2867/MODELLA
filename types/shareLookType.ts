import { ClothingItem } from "./clothTypes";

export type ShareLookType = {
  _id: string;
  lookId: string;
  userId?: string;
  profileImage?: string | null;
  createdAt: Date;
  items: ClothingItem[];
  likes: string[];
  comments: {
    userId: string;
    userName?: string;
    profileImage?: string | null;
    text: string;
    createdAt: Date;
  }[];
  gender?: "male" | "female" | null;
};
