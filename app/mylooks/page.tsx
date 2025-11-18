"use client";
import { useEffect, useState } from "react";
import MyLooks from "@/app/Components/MyLooks/MyLooks";
import Headers from "../Components/Header/Header";
import Footer from "../Components/Footer/Footer";
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
    <div>
      <Headers />

      <MyLooks userId={userId} />
      <Footer></Footer>
    </div>
  );
}
