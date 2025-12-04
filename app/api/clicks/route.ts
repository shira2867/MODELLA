import { NextResponse } from "next/server";
import {
  addOrUpdateClick,
  getUserClicks,
} from "@/services/server/clickSuggestions";
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
    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;

    if (!userId) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }
    const body = await req.json();
    const { category, color } = body;
    if ( !category || !color)
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
