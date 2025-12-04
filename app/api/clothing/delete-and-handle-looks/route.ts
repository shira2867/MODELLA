import { NextResponse } from "next/server";
import { deleteClothing } from "@/services/server/clothing";
import { looksCollection } from "@/services/server/looks";
import { cookies } from "next/headers";


export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;

    if (!userId) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }
    const body = await req.json();
    const clothingId: string = body?.clothingId;
    const actionPerLook: Array<{
      lookId: string;
      action: "update" | "delete";
    }> = body?.actionPerLook ?? [];

    if (!clothingId) {
      return NextResponse.json(
        { message: "Missing clothingId" },
        { status: 400 }
      );
    }

    const looksCol = await looksCollection();

    const results = {
      updatedLooks: [] as string[],
      deletedLooks: [] as string[],
      notFoundLooks: [] as string[],
    };

    for (const entry of actionPerLook) {
      const { lookId, action } = entry;
      if (!lookId) continue;

      const existing = await looksCol.findOne({ _id: lookId });
      if (!existing) {
        results.notFoundLooks.push(lookId);
        continue;
      }

      if (action === "update") {
        await looksCol.updateOne(
          { _id: lookId },
          { $pull: { items: { _id: clothingId } } }
        );
        results.updatedLooks.push(lookId);
      } else if (action === "delete") {
        await looksCol.deleteOne({ _id: lookId });
        results.deletedLooks.push(lookId);
      }
    }

    await deleteClothing(clothingId);

    return NextResponse.json({
      success: true,
      message: "Processed looks and deleted clothing",
      ...results,
    });
  } catch (err) {
    console.error("Error in delete-and-handle-looks:", err);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value;

  if (!userId) {
    return NextResponse.json(
      { message: "Unauthorized" },
      { status: 401 }
    );
  }

  const url = new URL(req.url);
  const clothingId = url.searchParams.get("id");

  if (!clothingId) {
    return NextResponse.json({ error: "Missing clothingId" }, { status: 400 });
  }

  const col = await looksCollection();

  const relatedLooks = await col
    .find({ "items._id": clothingId })
    .toArray();

  const looks = relatedLooks.map((look) => ({
    _id: look._id.toString(),
    items: look.items.map((item: any) => ({
      _id: item._id,
      imageUrl: item.imageUrl,
      category: item.category,
      colorName: item.colorName,
      style: item.style,
    })),
  }));

  return NextResponse.json({ looks });
}
