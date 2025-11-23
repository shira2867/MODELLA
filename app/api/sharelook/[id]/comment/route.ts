import { NextRequest, NextResponse } from "next/server";
import { shareLooksCollection } from "@/services/server/shareLook";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params; 
    const { userId, text } = await req.json();

    if (!userId || !text) {
      return NextResponse.json({ error: "Missing userId or text" }, { status: 400 });
    }

    const newComment = {
      userId,
      text,
      createdAt: new Date(), 
    };

    const collection = await shareLooksCollection();

    const result = await collection.updateOne(
      { _id: id },
      { $push: { comments: newComment } }  // ← ← ← תיקון כאן
    );

    console.log("Update result:", result);

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Look not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      comments: newComment,
      matched: result.matchedCount,
      modified: result.modifiedCount,
    });
  } catch (err) {
    console.error("Error adding comment:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
