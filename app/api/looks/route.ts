// /app/api/looks/route.ts (Next.js 13+ עם app router)
import { NextRequest, NextResponse } from "next/server";
import { looksCollection, LookType } from "../../../services/server/looks";

export async function POST(req: NextRequest) {
  try {
    const body: LookType = await req.json();

    if (!body.items || body.items.length === 0) {
      return NextResponse.json(
        { error: "Cannot create Look without items" },
        { status: 400 }
      );
    }

    const newLook: LookType = {
      ...body,
      createdAt: new Date(),
      _id: `look_${Date.now()}` 
    };

    const collection = await looksCollection();
    await collection.insertOne(newLook);

    return NextResponse.json({ success: true, look: newLook }, { status: 201 });
  } catch (error) {
    console.error("Error creating Look:", error);
    return NextResponse.json(
      { error: "Failed to create Look" },
      { status: 500 }
    );
  }
}
