import { ClothingItem } from "./clothTypes";

export type ShareLookType = {
  _id: string;
  lookId: string;
  userId?: string;
  profileImage?: string;
  createdAt: Date;
  items: ClothingItem[];
  likes: string[];
  comments: {
    userId: string;
    userName: string;
    profileImage?: string;
    text: string;
    createdAt: Date;
  }[];
  gender?: "male" | "female" | null;
};
