import { NextResponse } from "next/server";
import {
  addChecklistItem,
  getChecklistItems,
  updateChecklistItem,
  deleteChecklistItem,
} from "@/services/server/checkList";
import { cookies } from "next/headers";

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
    const result = await addChecklistItem(body);

    return NextResponse.json({
      ...body,
      _id: result.insertedId.toString(),
      createdAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error("Error adding checklist item:", err);
    return NextResponse.json({ message: "Error adding item" }, { status: 500 });
  }
}


export async function PUT(req: Request) {
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
    const { id, text, completed } = body;

    if (!id) {
      return NextResponse.json(
        { message: "Missing id" },
        { status: 400 }
      );
    }

    // עדכון במסד הנתונים
    const updated = await updateChecklistItem(id, { text, completed });

    // החזרת אובייקט מלא ל־client
    return NextResponse.json({
      message: "Item updated",
      item: {
        _id: id,
        text,
        completed,
        ...(updated?.createdAt && { createdAt: updated.createdAt }),
        ...(updated?.userId && { userId: updated.userId }),
      },
    });
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
