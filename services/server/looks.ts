import { getDb } from "./db";

// פונקציה לקבלת הקולקשן של Looks
export async function looksCollection() {
  const db = await getDb();
  return db.collection("looks");
}

// טיפוס לכל פריט ב-Look (Cloth)
export type LookItem = {
  _id: string;             // מזהה ייחודי של הבגד
  categoryId: string;       // מזהה קטגוריה
  imageUrl: string;         // כתובת תמונה
  colorName: string;        // צבע הבגד
  thickness: "light" | "medium" | "heavy"; // עובי הבגד
  style: string;            // סגנון הבגד
  tags?: string[];          // תגים אופציונליים
  createdAt?: Date;         // תאריך הוספה של הבגד
};

// טיפוס למסמך Look
export type LookType = {
  _id?: string;             // מזהה Look (יכול להיווצר אוטומטית)
  userId: string;            // מזהה המשתמש
  items: LookItem[];         // מערך של בגדים
  imageUrl?: string;         // תמונת Look כוללת
  createdAt?: Date;          // תאריך יצירת ה-Look
};
