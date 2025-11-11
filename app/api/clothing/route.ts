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
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const userId = url.searchParams.get("userId");
    if (!userId)
      return NextResponse.json({ message: "Missing userId" }, { status: 400 });

    const items = await getAllClothingItem(userId);
    return NextResponse.json(items);
  } catch (error) {
    console.error("Error fetching clothing:", error);
    return NextResponse.json(
      { message: "Error fetching items" },
      { status: 500 }
    );
  }
}
