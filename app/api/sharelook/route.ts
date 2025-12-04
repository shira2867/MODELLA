import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers"; 
import { shareLooksCollection } from "@/services/server/shareLook";
import { looksCollection } from "@/services/server/looks";

import { ShareLookType } from "@/types/shareLookType";


export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    const body = await req.json();
    const { lookId ,profileImage} = body;

    if (!lookId ) {
      return NextResponse.json({ error: "Missing lookId" }, { status: 400 });
    }

    const lookCol = await looksCollection();
    const originalLook = await lookCol.findOne({ _id: lookId });
    if (!originalLook) return NextResponse.json({ error: "Look not found" }, { status: 404 });
     if (originalLook.userId && originalLook.userId !== userId) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }
    
    const newShareLook: ShareLookType = {
      ...originalLook,
      lookId,
      userId,
      createdAt: new Date(),
      likes: [],
      comments: [],
      _id: `shared_${Date.now()}`,
      profileImage: profileImage || "123456789", 
    };

    const shareCol = await shareLooksCollection();
    await shareCol.insertOne(newShareLook);

    return NextResponse.json({ success: true, _id: newShareLook._id, shareLook: newShareLook }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}


export async function GET() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value;

  if (!userId) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }
  const collection = await shareLooksCollection();
  const looks = await collection.find().sort({ createdAt: -1 }).toArray();
  return NextResponse.json(looks);
}

