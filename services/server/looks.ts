import type { Collection, Db } from "mongodb";
import { getDb } from "./db";

import { LookType } from "@/types/lookTypes";

export async function looksCollection(): Promise<Collection<LookType>> {
  const db = (await getDb()) as Db;
  return db.collection("looks") as Collection<LookType>;
}
