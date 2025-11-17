// app/home/page.tsx
"use client";
import MyLooks from "@/app/Components/MyLooks/MyLooks";
export default function ShowMyLooks() {
  const userId = "123"; // כאן תמשכי את ה-userId מהסשן או פרופ

  return (
    <div style={{ padding: "2rem" }}>
      <MyLooks userId={userId} />
    </div>
  );
}
