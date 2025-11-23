import { NextRequest, NextResponse } from "next/server";
import { shareLooksCollection } from "@/services/server/shareLook";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params; // ✅ עכשיו זה אובייקט רגיל
  const trimmedId = id.trim();

  try {
    const collection = await shareLooksCollection();
    const look = await collection.findOne({ _id: trimmedId });

    if (!look) {
      return NextResponse.json({ error: "Look not found" }, { status: 404 });
    }

    return NextResponse.json(look);
  } catch (err) {
    console.error("Error fetching shared look:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
