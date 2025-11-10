// services/server/clothing.ts
import { getDb } from "./db";
import { ObjectId } from "mongodb";

export async function addClothingItem(item: any) {
  const db = await getDb();
  const collection = db.collection("clothes"); // שם הקולקשן במונגו

  const result = await collection.insertOne(item);
  return result;
}

export async function getAllClothingItem(userId: string) {
  const db = await getDb();
  const collection = db.collection("clothes");

  const items = await collection.find({ userId }).toArray();
  return items;
}

export async function updateClothing(id: string, updatedData: any) {
  const db = await getDb();
  const collection = db.collection("clothes");

  const result = await collection.updateOne(
    { _id: new ObjectId(id) },
    { $set: updatedData }
  );
  return result;
}

export async function deleteClothing(id: string) {
  const db = await getDb();
  const collection = db.collection("clothes");

  const result = await collection.deleteOne({ _id: new ObjectId(id) });
  return result;
}
