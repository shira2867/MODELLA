import { NextRequest, NextResponse } from "next/server";
import { shareLooksCollection } from "@/services/server/shareLook";
import { looksCollection } from "@/services/server/looks";
import { usersCollection } from "@/services/server/users";
import { ObjectId } from "mongodb";
import { ShareLookType } from "@/types/shareLookType";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { lookId, userId, profileImage } = body;

    if (!lookId || !userId) {
      return NextResponse.json(
        { error: "Missing lookId or userId" },
        { status: 400 }
      );
    }

    const lookCol = await looksCollection();
    const originalLook = await lookCol.findOne({ _id: lookId });
    if (!originalLook)
      return NextResponse.json({ error: "Look not found" }, { status: 404 });

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

export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get("userId");
    const shareCol = await shareLooksCollection();
    const userCol = await usersCollection();
    if (!userId) {
      const allLooks = await shareCol.find().sort({ createdAt: -1 }).toArray();
      return NextResponse.json(allLooks);
    }
    const currentUser = await userCol.findOne({ _id: new ObjectId(userId) });
    const currentUserGender = currentUser?.gender || null;

    const allLooks = await shareCol.find().sort({ createdAt: -1 }).toArray();
    const looksWithGender = await Promise.all(
      allLooks.map(async (look) => {
        if (!look.userId) return { ...look, gender: null };

        let user = null;
        if (ObjectId.isValid(look.userId)) {
          user = await userCol.findOne({ _id: new ObjectId(look.userId) });
        }
        return { ...look, gender: user?.gender || null };
      })
    );

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
