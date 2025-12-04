import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ObjectId } from "mongodb";

import { shareLooksCollection } from "@/services/server/shareLook";
import { looksCollection } from "@/services/server/looks";
import { usersCollection } from "@/services/server/users";
import { ShareLookType } from "@/types/shareLookType";

// --------------------- POST --------------------- //

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

    const body = await req.json();
    const { lookId, profileImage } = body;

    if (!lookId) {
      return NextResponse.json(
        { error: "Missing lookId" },
        { status: 400 }
      );
    }

    const lookCol = await looksCollection();
    const originalLook = await lookCol.findOne({ _id: lookId });

    if (!originalLook) {
      return NextResponse.json(
        { error: "Look not found" },
        { status: 404 }
      );
    }

    // ודאות שהמשתמש לא משתף לוק שלא שלו
    if (originalLook.userId && originalLook.userId !== userId) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    const newShareLook: ShareLookType = {
      ...originalLook,
      lookId,
      userId,
      createdAt: new Date(),
      likes: [],
      comments: [],
      _id: `shared_${Date.now()}`,
      profileImage: profileImage || "123456789",
    };

    const shareCol = await shareLooksCollection();
    await shareCol.insertOne(newShareLook);

    return NextResponse.json(
      { success: true, _id: newShareLook._id, shareLook: newShareLook },
      { status: 201 }
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// --------------------- GET --------------------- //

export async function GET() {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const shareCol = await shareLooksCollection();
    const userCol = await usersCollection();

    // מביאים את המשתמש כדי לדעת את המגדר
    const currentUser = await userCol.findOne({ _id: new ObjectId(userId) });
    const currentUserGender = currentUser?.gender || null;

    // מביאים את כל הלוקים ששופו
    const allLooks = await shareCol.find().sort({ createdAt: -1 }).toArray();

    // מוסיפים מידע על המגדר של היוצר לכל לוק
    const looksWithGender = await Promise.all(
      allLooks.map(async (look: any) => {
        if (!look.userId) return { ...look, gender: null };

        let user = null;
        if (ObjectId.isValid(look.userId)) {
          user = await userCol.findOne({ _id: new ObjectId(look.userId) });
        }

        return { ...look, gender: user?.gender || null };
      })
    );

    // מסננים לפי המגדר של המשתמש הנוכחי
    const filteredLooks = looksWithGender.filter(
      (look) => look.gender === currentUserGender
    );

    return NextResponse.json(filteredLooks);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
