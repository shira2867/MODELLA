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
      _id: look._id, 
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




export async function DELETE(
  req: NextRequest,
  context: RouteContext
) {
  const { id } = await context.params;

  try {
    const col = await looksCollection();

    const result = await col.deleteOne({ _id: id });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: "Look not found or already deleted" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Look deleted successfully" });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to delete look" },
      { status: 500 }
    );
  }
}