// /app/api/looks/route.ts
import { NextRequest, NextResponse } from "next/server";
import { looksCollection, LookType, LookItem } from "../../../services/server/looks";

type MyLookSummary = {
  _id: string;
  imageUrl: string;
  style: string;
  colorName: string;
};

type DbLook = {
  _id: string;
  items?: LookItem[];
  imageUrl?: string;
  createdAt?: Date;
};


export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as LookType;

    if (!body.items || body.items.length === 0) {
      return NextResponse.json(
        { error: "Cannot create Look without items" },
        { status: 400 }
      );
    }

    const newLook: LookType = {
      ...body,
      createdAt: new Date(),
      _id: `look_${Date.now()}`,
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

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const userId = url.searchParams.get("userId")?.trim();

    if (!userId) {
      return NextResponse.json({ message: "Missing userId" }, { status: 400 });
    }

    const collection = await looksCollection();

    const looks = await collection.find({ userId }).toArray();

    return NextResponse.json(looks);
  } catch (error) {
    console.error("Error fetching Looks:", error);
    return NextResponse.json(
      { message: "Error fetching looks" },
      { status: 500 }
    );
  }
}

