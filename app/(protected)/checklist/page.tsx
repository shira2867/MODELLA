"use client";
import CheckList from "@/app/Components/CheckList/CheckList";
import { useUserStore } from "@/store/userStore";
export default function CheckListPage() {
  const userId = useUserStore((state) => state.userId);

  return (
    <div>
      <CheckList userId={userId || ""} />
    </div>
  );
}
