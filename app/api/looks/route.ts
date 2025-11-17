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

// =========================
//       CREATE LOOK (POST)
// =========================
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

// =========================
//     GET LOOKS LIST (GET)
// =========================
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "Missing userId" },
        { status: 400 }
      );
    }

    const collection = await looksCollection();

    // בלי ג'נריק על find/project – רק cast בסוף
    const looks = (await collection
      .find({ userId })
      .project({
        _id: 1,
        items: 1,
        imageUrl: 1,
        createdAt: 1,
      })
      .toArray()) as DbLook[];

    const formatted: MyLookSummary[] = looks.map((look) => {
      const first = look.items?.[0];

      return {
        _id: look._id,
        imageUrl: look.imageUrl || first?.imageUrl || "",
        style: first?.style || "casual",
        colorName: first?.colorName || "Black",
      };
    });

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("Error fetching Looks:", error);
    return NextResponse.json(
      { error: "Failed to fetch Looks" },
      { status: 500 }
    );
  }
}
