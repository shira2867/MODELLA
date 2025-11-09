// services/server/users.ts
import { getDb } from "./db";

export async function usersCollection() {
  const db = await getDb();
  return db.collection("users");
}

// Type for convenience
export type UserType = {
  _id?: any;
  name?: string;
  email: string;
  passwordHash?: string;
  profileImage?: string;
  gender?: "male" | "female";
  createdAt?: Date;
};
