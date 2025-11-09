// app/api/clothing/route.ts
import { NextResponse } from "next/server";
import { addClothingItem } from "@/services/server/clothing";

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
