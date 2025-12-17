import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ObjectId } from "mongodb";
import { shareLooksCollection } from "@/services/server/shareLook";
import { looksCollection } from "@/services/server/looks";
import { usersCollection } from "@/services/server/users";
import { ShareLookType } from "@/types/shareLookType";

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { lookId } = await req.json();
    if (!lookId) {
      return NextResponse.json({ error: "Missing lookId" }, { status: 400 });
    }

    const lookCol = await looksCollection();
    const originalLook = await lookCol.findOne({ _id: lookId });

    if (!originalLook) {
      return NextResponse.json({ error: "Look not found" }, { status: 404 });
    }

    if (originalLook.userId && originalLook.userId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const {
      profileImage: _ignore,
      _id: _oldId,
      ...restLook
    } = originalLook as any;

    const newShareLook: ShareLookType = {
      ...restLook,
      lookId,
      userId,
      createdAt: new Date(),
      likes: [],
      comments: [],
      _id: `shared_${Date.now()}`,
    };

    const shareCol = await shareLooksCollection();
    await shareCol.insertOne(newShareLook);

    return NextResponse.json(
      { success: true, shareLook: newShareLook },
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

export async function GET() {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const shareCol = await shareLooksCollection();
    const userCol = await usersCollection();

    const allLooks = await shareCol.find().sort({ createdAt: -1 }).toArray();

    const looksWithOwnerMeta = await Promise.all(
      allLooks.map(async (look: any) => {
        if (!look.userId) {
          return { ...look, profileImage: null };
        }

        const creator = ObjectId.isValid(look.userId)
          ? await userCol.findOne({ _id: new ObjectId(look.userId) })
          : await userCol.findOne({ _id: look.userId });

        return {
          ...look,
          profileImage:
            typeof creator?.profileImage === "string"
              ? creator.profileImage
              : null,
        };
      })
    );

    const allComments = looksWithOwnerMeta.flatMap(
      (look: any) => look.comments || []
    );

    const commentUserIds = Array.from(
      new Set(
        allComments
          .map((c: any) => c.userId)
          .filter((id: string) => ObjectId.isValid(id))
      )
    ).map((id) => new ObjectId(id));

    let usersById: Record<string, any> = {};

    if (commentUserIds.length > 0) {
      const users = await userCol
        .find({ _id: { $in: commentUserIds } })
        .project({ _id: 1, name: 1, profileImage: 1 })
        .toArray();

      usersById = users.reduce((acc: Record<string, any>, u: any) => {
        acc[u._id.toString()] = u;
        return acc;
      }, {});
    }

    const enrichedLooks = looksWithOwnerMeta.map((look: any) => ({
      ...look,
      comments: (look.comments || []).map((c: any) => {
        const user = usersById[c.userId];
        return {
          ...c,
          userName: user?.name || c.userName || "User",
          profileImage: user?.profileImage || c.profileImage || null,
        };
      }),
    }));

    return NextResponse.json(enrichedLooks, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
