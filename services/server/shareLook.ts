import type { Collection, Db } from "mongodb";
import { getDb } from "./db";

import { ShareLookType } from "@/types/shareLookType";

export async function shareLooksCollection(): Promise<Collection<ShareLookType>> {
  const db = (await getDb()) as Db;
  return db.collection("shareLook") as Collection<ShareLookType>;
}



