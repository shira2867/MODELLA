import { NextRequest, NextResponse } from "next/server";
import { shareLooksCollection } from "@/services/server/shareLook";


export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const collection = await shareLooksCollection();

    let look = await collection.findOne({ _id: id });

    if (!look) {
      look = await collection.findOne({ lookId: id });
    }

    if (!look) {
      return NextResponse.json({
        isShared: false,
        _id: id,
        likes: [],
        items: [],
        comments: [],
      }, { status: 200 });
    }

    return NextResponse.json({
      isShared: true,
      _id: look._id,
      likes: look.likes || [],
      items: look.items || [],
      comments: look.comments || [],
    }, { status: 200 });
  } catch (err) {
    console.error("Error fetching shared look:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}



export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params; 
  const collection = await shareLooksCollection();
  const result = await collection.deleteOne({ _id: id });

  if (result.deletedCount === 0) {
    return NextResponse.json({ error: "Look not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
