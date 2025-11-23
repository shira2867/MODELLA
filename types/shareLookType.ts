

import{ClothingItem}from"./clothTypes";

export type LookComment = {
  userId: string;
  comment: string;
  createdAt: string | Date;
};

export type ShareLookType = {
  _id: string;
  userId: string;
  items: ClothingItem[];      
  createdAt: string | Date;
  likes: string[];        
  comments: LookComment[]; 
};
