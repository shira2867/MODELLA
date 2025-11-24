

import{ClothingItem}from"./clothTypes";





export type ShareLookType = {
  _id: string;             
  lookId: string;           
  userId?: string;          
  createdAt: Date;          
  items: ClothingItem[];   
  likes: string[];          
  comments: {
    userId: string;
    text: string;
    createdAt: Date;
  }[];                     
};
