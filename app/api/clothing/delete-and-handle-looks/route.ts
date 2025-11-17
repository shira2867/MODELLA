import { NextResponse } from "next/server";
import { deleteClothing } from "@/services/server/clothing";
import { looksCollection } from "@/services/server/looks";

/**
 * ציפייה לגוף POST:
 * {
 *   clothingId: string,
 *   actionPerLook: { lookId: string, action: "update" | "delete" }[]
 * }
 *
 * "update" -> להסיר את הפריט מ־items של אותו לוק (לא למחוק את הלוק)
 * "delete" -> למחוק את הלוק כולו
 *
 * בסוף הקוד מוחקים את הפריט מהמנגו (deleteClothing).
 */

export async function POST(req: Request) {
  try {
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

    // עיבוד לפי מה שנבחר עבור כל לוק
    for (const entry of actionPerLook) {
      const { lookId, action } = entry;
      if (!lookId) continue;

      const existing = await looksCol.findOne({ _id: lookId });
      if (!existing) {
        results.notFoundLooks.push(lookId);
        continue;
      }

      if (action === "update") {
        // הסרת הפריט מרשימת הפריטים של הלוק
        await looksCol.updateOne(
          { _id: lookId },
          { $pull: { items: { _id: clothingId } } }
        );
        results.updatedLooks.push(lookId);
      } else if (action === "delete") {
        // מחיקת הלוק כולו
        await looksCol.deleteOne({ _id: lookId });
        results.deletedLooks.push(lookId);
      }
    }

    // לבסוף - מוחקים את הפריט מהמנגו
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
