import { getDb } from "./db";

export async function addOrUpdateClick(
  userId: string,
  category: string,
  color: string
) {
  const db = await getDb();
  const collection = db.collection("clickSuggestions");

  const existing = await collection.findOne({ userId, category, color });

  if (existing) {
    const result = await collection.updateOne(
      { _id: existing._id },
      {
        $inc: { clickCount: 1 },
        $set: { lastClickedAt: new Date() },
      }
    );
    return {
      ...existing,
      clickCount: existing.clickCount + 1,
      suggest: existing.clickCount + 1 >= 4,
    };
  } else {
    const result = await collection.insertOne({
      userId,
      category,
      color,
      clickCount: 1,
      lastClickedAt: new Date(),
    });
    return { clickCount: 1, suggest: false };
  }
}

export async function getUserClicks(userId: string) {
  const db = await getDb();
  const collection = db.collection("clickSuggestions");

  const clicks = await collection.find({ userId }).toArray();
  return clicks;
}
