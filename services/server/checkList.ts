import { getDb } from "./db";
import { ObjectId } from "mongodb";

export async function addChecklistItem(item: { userId: string; text: string }) {
  const db = await getDb();
  const collection = db.collection("checkList");

  const result = await collection.insertOne({
    ...item,
    completed: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  return result;
}

export async function getChecklistItems(userId: string) {
  const db = await getDb();
  const collection = db.collection("checkList");

  const items = await collection.find({ userId }).toArray();
  return items;
}

export async function updateChecklistItem(
  id: string,
  updatedData: { text?: string; completed?: boolean }
) {
  const db = await getDb();
  const collection = db.collection("checkList");

  const result = await collection.updateOne(
    { _id: new ObjectId(id) },
    { $set: { ...updatedData, updatedAt: new Date() } }
  );
  return result;
}

export async function deleteChecklistItem(id: string) {
  const db = await getDb();
  const collection = db.collection("checkList");

  const result = await collection.deleteOne({ _id: new ObjectId(id) });
  return result;
}
