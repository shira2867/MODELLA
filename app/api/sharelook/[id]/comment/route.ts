import { NextRequest, NextResponse } from "next/server";
import { shareLooksCollection } from "@/services/server/shareLook";
import { cookies } from "next/headers";

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
    const { userName,profileImage, text } = await req.json();

    if (!text) {
      return NextResponse.json({ error: "Missing userId or text" }, { status: 400 });
    }

    const newComment = {
      userId,
      userName,
      profileImage,
      text,
      createdAt: new Date(), 
    };

    const collection = await shareLooksCollection();

    const result = await collection.updateOne(
      { _id: id },
      { $push: { comments: newComment } }  
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


export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;    
    const collection = await shareLooksCollection();

    console.log("Fetching comments for lookId:", id);

    let look = await collection.findOne({ _id: id });
    if (!look) {
      look = await collection.findOne({ lookId: id });
      console.log("Look found by lookId:", look);
    }

    if (!look) {
      return NextResponse.json({ comments: [] }, { status: 200 });
    }

    return NextResponse.json({ comments: look.comments || [] }, { status: 200 });
  } catch (err) {
    console.error("Error fetching comments:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}