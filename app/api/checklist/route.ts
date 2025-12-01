import { NextResponse } from "next/server";
import {
  addChecklistItem,
  getChecklistItems,
  updateChecklistItem,
  deleteChecklistItem,
} from "@/services/server/checkList";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const userId = url.searchParams.get("userId");
    if (!userId)
      return NextResponse.json({ message: "Missing userId" }, { status: 400 });

    const items = await getChecklistItems(userId);
    return NextResponse.json(items);
  } catch (err) {
    console.error("Error fetching checklist items:", err);
    return NextResponse.json(
      { message: "Error fetching items" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = await addChecklistItem(body);
    return NextResponse.json({ message: "Item added", id: result.insertedId });
  } catch (err) {
    console.error("Error adding checklist item:", err);
    return NextResponse.json({ message: "Error adding item" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, text, completed } = body;
    if (!id)
      return NextResponse.json({ message: "Missing id" }, { status: 400 });

    const updated = await updateChecklistItem(id, { text, completed });
    return NextResponse.json({ message: "Item updated", item: updated });
  } catch (err) {
    console.error("Error updating checklist item:", err);
    return NextResponse.json(
      { message: "Error updating item" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    if (!id)
      return NextResponse.json({ message: "Missing id" }, { status: 400 });

    await deleteChecklistItem(id);
    return NextResponse.json({ message: "Item deleted successfully" });
  } catch (err) {
    console.error("Error deleting checklist item:", err);
    return NextResponse.json(
      { message: "Error deleting item" },
      { status: 500 }
    );
  }
}
