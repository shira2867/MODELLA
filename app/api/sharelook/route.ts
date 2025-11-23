import { NextRequest, NextResponse } from "next/server";
import {ShareLookType} from "@/types/shareLookType";
import { shareLooksCollection } from "@/services/server/shareLook";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as ShareLookType;

    if (!body.items || body.items.length === 0) {
      return NextResponse.json(
        { error: "Cannot create Look without items" },
        { status: 400 }
      );
    }


    const newShareLook: ShareLookType = {
      ...body,
      createdAt: new Date(),
      likes: [],
      comments: [],
      _id: `shared_${Date.now()}`
    };

    const collection = await shareLooksCollection();
    await collection.insertOne(newShareLook);

    return NextResponse.json({ success: true, shareLook: newShareLook }, { status: 201 });
  } catch (error) {
    console.error("Error creating ShareLook:", error);
    return NextResponse.json(
      { error: "Failed to create ShareLook" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const collection = await shareLooksCollection();
    const looks = await collection.find().sort({ createdAt: -1 }).toArray();
    return NextResponse.json(looks);
  } catch (err) {
    return NextResponse.json({ error: "Failed to load looks" }, { status: 500 });
  }
}
