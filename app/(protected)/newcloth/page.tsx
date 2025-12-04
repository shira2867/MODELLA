"use client";

import { useUserStore } from "@/store/userStore";
import NewCloth from "@/app/Components/NewCloth/NewCloth";

export default function AddItemPage() {
  const userId = useUserStore((state) => state.userId);

  return (
    <div>
      <NewCloth userId={userId || ""} />
    </div>
  );
}
