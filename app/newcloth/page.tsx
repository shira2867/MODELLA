// app/add-item/page.tsx
"use client";

import { useUserStore } from "@/store/userStore";
import NewCloth from "@/app/Components/NewCloth/NewCloth";

export default function AddItemPage() {
  const userId = useUserStore((state) => state.userId); 

  return (
    <div style={{ padding: "2rem" }}>
      <NewCloth userId={userId || ""} />
    </div>
  );
}
