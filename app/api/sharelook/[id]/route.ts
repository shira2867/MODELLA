import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { shareLooksCollection } from "@/services/server/shareLook";
import { usersCollection } from "@/services/server/users"; // נניח שיש מסד משתמשים

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
        profileImage: null, 
      }, { status: 200 });
    }

    let profileImage = null;
    if (look.userId) {
      const usersCol = await usersCollection();
      const user = await usersCol.findOne({ _id: look.userId });
      if (user) profileImage = user.profileImage || null;
    }

    return NextResponse.json({
      isShared: true,
      _id: look._id,
      likes: look.likes || [],
      items: look.items || [],
      comments: look.comments || [],
      profileImage,
    }, { status: 200 });
  } catch (err) {
    console.error("Error fetching shared look:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}




export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try{
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
      return NextResponse.json(
        { error: "Look not found" },
        { status: 404 }
      );
    }

    if (look.userId && look.userId !== userId) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    const result = await collection.deleteOne({ _id: id });
    if (result.deletedCount === 0) {
    return NextResponse.json({ error: "Look not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });

  }
  catch (err) {
    console.error("Error deleting shared look:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

  

