import { NextResponse } from "next/server";
import {
  addOrUpdateClick,
  getUserClicks,
} from "@/services/server/clickSuggestions";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const userId = url.searchParams.get("userId");
    if (!userId)
      return NextResponse.json({ message: "Missing userId" }, { status: 400 });

    const clicks = await getUserClicks(userId);
    return NextResponse.json(clicks);
  } catch (err) {
    console.error("Error fetching clicks:", err);
    return NextResponse.json(
      { message: "Error fetching clicks" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, category, color } = body;
    if (!userId || !category || !color)
      return NextResponse.json(
        { message: "Missing parameters" },
        { status: 400 }
      );

    const result = await addOrUpdateClick(userId, category, color);
    return NextResponse.json(result);
  } catch (err) {
    console.error("Error updating click:", err);
    return NextResponse.json(
      { message: "Error updating click" },
      { status: 500 }
    );
  }
}
