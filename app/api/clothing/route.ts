import { NextResponse } from "next/server";
import {
  addClothingItem,
  getAllClothingItem,
} from "@/services/server/clothing";
import { deleteClothing } from "@/services/server/clothing";
import { looksCollection } from "@/services/server/looks";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;

    if (!userId) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    (body as any).userId = userId;
    const result = await addClothingItem(body);
    return NextResponse.json({ message: "Item added", id: result.insertedId });
  } catch (error) {
    console.error("Error adding clothing:", error);
    return NextResponse.json({ message: "Error saving item" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;

    if (!userId) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const url = new URL(req.url);
    const itemId = url.searchParams.get("id");


    const looksCol = await looksCollection();

    if (itemId) {
      const relatedLooks = await looksCol
        .find({ "items._id": itemId })
        .toArray();
      return NextResponse.json({ lookNames: relatedLooks.map((l) => l._id) });
    }

    // אם אין itemId – מחזירים את כל הבגדים של המשתמש המחובר
    const items = await getAllClothingItem(userId);
    return NextResponse.json(items);

  } catch (err) {
    console.error("Error fetching clothing or related looks:", err);
    return NextResponse.json(
      { message: "Error fetching data" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;

    if (!userId) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    if (!id)
      return NextResponse.json({ message: "Missing id" }, { status: 400 });

    const looksCol = await looksCollection();

    const relatedLooks = await looksCol.find({ "items._id": id }).toArray();
    await looksCol.deleteMany({ "items._id": id });

    await deleteClothing(id);

    return NextResponse.json({
      message: "Item and related looks deleted successfully",
      deletedLooks: relatedLooks.map((l) => l._id),
    });
  } catch (error) {
    console.error("Error deleting clothing:", error);
    return NextResponse.json(
      { message: "Error deleting item" },
      { status: 500 }
    );
  }
}
