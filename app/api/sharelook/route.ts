import { NextRequest, NextResponse } from "next/server";
import { shareLooksCollection } from "@/services/server/shareLook";
import { looksCollection } from "@/services/server/looks";
import { ShareLookType } from "@/types/shareLookType";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { lookId, userId } = body;

  if (!lookId) return NextResponse.json({ error: "Missing lookId" }, { status: 400 });

  const lookCol = await looksCollection();
  const originalLook = await lookCol.findOne({ _id: lookId });
  if (!originalLook) return NextResponse.json({ error: "Look not found" }, { status: 404 });

  const newShareLook: ShareLookType = {
    ...originalLook,
    lookId,
    userId,
    createdAt: new Date(),
    likes: [],
    comments: [],
    _id: `shared_${Date.now()}`,
  };

  const shareCol = await shareLooksCollection();
  await shareCol.insertOne(newShareLook);

  return NextResponse.json({ success: true, _id: newShareLook._id, shareLook: newShareLook }, { status: 201 });
}

export async function GET() {
  const collection = await shareLooksCollection();
  const looks = await collection.find().sort({ createdAt: -1 }).toArray();
  return NextResponse.json(looks);
}
