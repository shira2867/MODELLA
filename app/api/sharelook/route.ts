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
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { lookId } = body;

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

    if (originalLook.userId && originalLook.userId !== userId) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    const {
      profileImage: _oldProfileImage,
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
    const currentUser = await userCol.findOne({ _id: new ObjectId(userId) });
    const currentUserGender = currentUser?.gender || null;
    const allLooks = await shareCol.find().sort({ createdAt: -1 }).toArray();
    const looksWithOwnerMeta = await Promise.all(
      allLooks.map(async (look: any) => {
        if (!look.userId) {
          return {
            ...look,
            gender: null,
            profileImage: null,
          };
        }

        let creator: any = null;

        if (ObjectId.isValid(look.userId)) {
          creator = await userCol.findOne({ _id: new ObjectId(look.userId) });
        } else {
          creator = await userCol.findOne({ _id: look.userId });
        }

        const gender = creator?.gender || null;
        const ownerProfileImage =
          typeof creator?.profileImage === "string"
            ? creator.profileImage
            : null;

        return {
          ...look,
          gender,
          profileImage: ownerProfileImage, 
        };
      })
    );


    const filteredLooks = looksWithOwnerMeta.filter(
      (look) => look.gender === currentUserGender
    );

    const allRawComments = filteredLooks.flatMap(
      (look: any) => look.comments || []
    );

    const userIds = Array.from(
      new Set(
        allRawComments
          .map((c: any) => c.userId)
          .filter((id: string | undefined) => !!id)
      )
    );

    let usersById: Record<string, any> = {};

    if (userIds.length > 0) {
      const objectIds = userIds
        .filter((id) => ObjectId.isValid(id))
        .map((id) => new ObjectId(id));

      const users = await userCol
        .find({ _id: { $in: objectIds } })
        .project({ _id: 1, name: 1, profileImage: 1 })
        .toArray();

      usersById = users.reduce((acc: Record<string, any>, user: any) => {
        acc[user._id.toString()] = user;
        return acc;
      }, {});
    }

    const enrichedLooks = filteredLooks.map((look: any) => {
      const rawComments = look.comments || [];

      const enrichedComments = rawComments.map((c: any) => {
        const user = c.userId ? usersById[c.userId] : null;

        const userName =
          (typeof user?.name === "string" && user.name.trim()) ||
          (typeof c.userName === "string" && c.userName.trim()) ||
          "User";

        const profileImage =
          user?.profileImage ??
          c.profileImage ??
          null;

        return {
          ...c,
          userName,
          profileImage,
        };
      });

      return {
        ...look,
        comments: enrichedComments,
      };
    });

    return NextResponse.json(enrichedLooks, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
