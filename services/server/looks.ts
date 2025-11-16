// services/server/looks.ts
import type { Collection, Db } from "mongodb";
import { getDb } from "./db";

// טיפוס לכל פריט ב-Look (Cloth)
export type LookItem = {
  _id: string;             // מזהה ייחודי של הבגד
  categoryId: string;      // מזהה קטגוריה
  imageUrl: string;        // כתובת תמונה
  colorName: string;       // צבע הבגד
  thickness: "light" | "medium" | "heavy"; // עובי הבגד
  style: string;           // סגנון הבגד
  tags?: string[];         // תגים אופציונליים
  createdAt?: Date;        // תאריך הוספה של הבגד
};

// טיפוס למסמך Look
export type LookType = {
  _id: string;             // מזהה Look – חובה, כי למונגו תמיד יש _id
  userId: string;          // מזהה המשתמש
  items: LookItem[];       // מערך של בגדים
  imageUrl?: string;       // תמונת Look כוללת
  createdAt?: Date;        // תאריך יצירת ה-Look
};

// פונקציה לקבלת הקולקשן של Looks – עם cast במקום ג'נריק
export async function looksCollection(): Promise<Collection<LookType>> {
  const db = (await getDb()) as Db;
  return db.collection("looks") as Collection<LookType>;
}
