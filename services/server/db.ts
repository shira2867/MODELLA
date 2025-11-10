// services/server/db.ts
import clientPromise from "./mongo";

export async function getDb() {
  const client = await clientPromise;
  return client.db("modella");  // החליפי לשם ה-DB שאת משתמשת בו
}
