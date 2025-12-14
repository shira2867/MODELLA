import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { shareLooksCollection } from "@/services/server/shareLook";
import { usersCollection } from "@/services/server/users";
import { ObjectId } from "mongodb";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const collection = await shareLooksCollection();
    let look = await collection.findOne({ _id: id });
    if (!look) {
      look = await collection.findOne({ lookId: id });
    }

    if (!look) {
      return NextResponse.json(
        {
          isShared: false,
          _id: id,
          likes: [],
          items: [],
          comments: [],
          profileImage: null,
        },
        { status: 200 }
      );
    }

    let profileImage: string | null = null;

    if (look.userId) {
      const usersCol = await usersCollection();

      let owner: any = null;

      if (typeof look.userId === "string" && ObjectId.isValid(look.userId)) {
        owner = await usersCol.findOne({ _id: new ObjectId(look.userId) });
      } else {
        owner = await usersCol.findOne({ _id: look.userId });
      }

      if (owner && typeof owner.profileImage === "string") {
        profileImage = owner.profileImage;
      }
    }

    const rawComments = look.comments || [];

    const userIds = Array.from(
      new Set(
        rawComments
          .map((c: any) => c.userId)
          .filter((userId: string | undefined) => !!userId)
      )
    );

    let usersById: Record<string, any> = {};

    if (userIds.length > 0) {
      const usersCol = await usersCollection();

      const objectIds = userIds
        .filter((uid) => ObjectId.isValid(uid))
        .map((uid) => new ObjectId(uid));

      const users = await usersCol
        .find({ _id: { $in: objectIds } })
        .project({ _id: 1, name: 1, profileImage: 1 })
        .toArray();

      usersById = users.reduce((acc: Record<string, any>, user: any) => {
        acc[user._id.toString()] = user;
        return acc;
      }, {});
    }

    const comments = rawComments.map((c: any) => {
      const user = c.userId ? usersById[c.userId] : null;

      const userName =
        (typeof user?.name === "string" && user.name.trim()) ||
        (typeof c.userName === "string" && c.userName.trim()) ||
        "User";

      const commentProfileImage =
        user?.profileImage ??
        c.profileImage ??
        null;

      return {
        ...c,
        userName,
        profileImage: commentProfileImage,
      };
    });

    return NextResponse.json(
      {
        isShared: true,
        _id: look._id,
        likes: look.likes || [],
        items: look.items || [],
        comments,
        profileImage,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("Error fetching shared look:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}


export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await context.params;
    const collection = await shareLooksCollection();

    const look = await collection.findOne({ _id: id });

    if (!look) {
      return NextResponse.json(
        { error: "Look not found" },
        { status: 404 }
      );
    }

    if (look.userId && look.userId !== userId) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    const result = await collection.deleteOne({ _id: id });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: "Look not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true },
      { status: 200 }
    );
  } catch (err) {
    console.error("Error deleting shared look:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
