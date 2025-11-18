// services/server/looks.ts
import type { Collection, Db } from "mongodb";
import { getDb } from "./db";

import { LookType } from "@/types/lookTypes";

// פונקציה לקבלת הקולקשן של Looks – עם cast במקום ג'נריק
export async function looksCollection(): Promise<Collection<LookType>> {
  const db = (await getDb()) as Db;
  return db.collection("looks") as Collection<LookType>;
}
