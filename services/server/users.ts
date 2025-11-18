import { getDb } from "./db";

export async function usersCollection() {
  const db = await getDb();
  return db.collection("users");
}


