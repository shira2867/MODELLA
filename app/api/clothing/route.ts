// app/api/clothing/route.ts
import { NextResponse } from "next/server";
import {
  addClothingItem,
  getAllClothingItem,
} from "@/services/server/clothing";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = await addClothingItem(body);
    return NextResponse.json({ message: "Item added", id: result.insertedId });
  } catch (error) {
    console.error("Error adding clothing:", error);
    return NextResponse.json({ message: "Error saving item" }, { status: 500 });
  }
}
// export async function GET(req: Request) {
//   try {
//     const url = new URL(req.url);
//     const userId = url.searchParams.get("userId");
//     if (!userId)
//       return NextResponse.json({ message: "Missing userId" }, { status: 400 });

//     const items = await getAllClothingItem(userId);
//     return NextResponse.json(items);
//   } catch (error) {
//     console.error("Error fetching clothing:", error);
//     return NextResponse.json(
//       { message: "Error fetching items" },
//       { status: 500 }
//     );
//   }
// }
import {  deleteClothing } from "@/services/server/clothing";
import { looksCollection } from "@/services/server/looks";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const userId = url.searchParams.get("userId"); // לשליפת בגדים
    const itemId = url.searchParams.get("id"); // לשליפת לוקים הקשורים לפריט

    const looksCol = await looksCollection();

    if (itemId) {
      const relatedLooks = await looksCol.find({ "items._id": itemId }).toArray();
      return NextResponse.json({ lookNames: relatedLooks.map(l => l._id) });
    }

    if (userId) {
      const items = await getAllClothingItem(userId);
      return NextResponse.json(items);
    }

    return NextResponse.json({ message: "Missing parameters" }, { status: 400 });
  } catch (err) {
    console.error("Error fetching clothing or related looks:", err);
    return NextResponse.json({ message: "Error fetching data" }, { status: 500 });
  }
}

// DELETE – מוחק בגד + לוקים קשורים
export async function DELETE(req: Request) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    if (!id) return NextResponse.json({ message: "Missing id" }, { status: 400 });

    const looksCol = await looksCollection();

    // מוצאים את הלוקים הקשורים לפריט
    const relatedLooks = await looksCol.find({ "items._id": id }).toArray();
    await looksCol.deleteMany({ "items._id": id });

    // מוחקים את הבגד עצמו מהמונגו
    await deleteClothing(id);

    return NextResponse.json({
      message: "Item and related looks deleted successfully",
      deletedLooks: relatedLooks.map(l => l._id),
    });
  } catch (error) {
    console.error("Error deleting clothing:", error);
    return NextResponse.json({ message: "Error deleting item" }, { status: 500 });
  }
}