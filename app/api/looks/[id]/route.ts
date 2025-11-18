import { NextRequest, NextResponse } from "next/server";
import { looksCollection } from "@/services/server/looks";
import {RouteContext} from "@/types/types"; ;



export async function GET(
  req: NextRequest,
  context: RouteContext
) {
  const { id } = await context.params;

  try {
    const col = await looksCollection();

    const look = await col.findOne({ _id: id });

    if (!look) {
      return NextResponse.json(
        { error: "Look not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      _id: look._id, // כבר string, אין צורך ב-toString()
      imageUrl: look.items?.[0]?.imageUrl ?? "",
      items: look.items ?? [],
      createdAt: look.createdAt,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to fetch look" },
      { status: 500 }
    );
  }
}