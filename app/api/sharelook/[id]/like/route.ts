import { NextRequest, NextResponse } from "next/server";
import { shareLooksCollection } from "@/services/server/shareLook";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params; // ✅ כאן ה־params נפרק נכון
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    const collection = await shareLooksCollection();

    const result = await collection.updateOne(
      { _id: id },
      { $addToSet: { likes: userId } }
    );

    console.log("Update result:", result);

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Look not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      matched: result.matchedCount,
      modified: result.modifiedCount,
    });
  } catch (err) {
    console.error("Error updating likes:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
