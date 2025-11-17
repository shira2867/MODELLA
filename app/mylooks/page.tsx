// app/home/page.tsx
"use client";
import { useEffect, useState } from "react";
import MyLooks from "@/app/Components/MyLooks/MyLooks";
export default function ShowMyLooks() {
  const [userId, setUserId] = useState<string | null>(null);
  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");
    setUserId(storedUserId);
  }, []);
 
  if (!userId) {
    return <div>Loading...</div>;  
  }
  return (
    <div style={{ padding: "2rem" }}>
      <MyLooks userId={userId} />
    </div>
  );
}
