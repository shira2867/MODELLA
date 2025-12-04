import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { looksCollection, } from "../../../services/server/looks";
import { LookType } from "@/types/lookTypes";

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
    const body = (await req.json()) as LookType;
    (body as any).userId = userId;

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
    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
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
