import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers"; 
import { shareLooksCollection } from "@/services/server/shareLook";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    const { id } = await context.params; 

    const collection = await shareLooksCollection();

    const look = await collection.findOne({ _id: id });
    if (!look) {
      return NextResponse.json({ error: "Look not found" }, { status: 404 });
    }

    let updatedLikes;
    if (look.likes?.includes(userId)) {
      updatedLikes = look.likes.filter((uid: string) => uid !== userId);
    } else {
      updatedLikes = [...(look.likes || []), userId];
    }

    await collection.updateOne(
      { _id: id },
      { $set: { likes: updatedLikes } }
    );

    return NextResponse.json({ success: true, likes: updatedLikes });
  } catch (err) {
    console.error("Error updating likes:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
