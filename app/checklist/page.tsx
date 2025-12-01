"use client";
import CheckList from "@/app/Components/CheckList/CheckList";
import { useUserStore } from "@/store/userStore";
import Header from "../Components/Header/Header";
import Footer from "../Components/Footer/Footer";
export default function CheckListPage() {
  const userId = useUserStore((state) => state.userId);

  return (
    <div>
      <Header />
      <CheckList userId={userId || ""} />
      <Footer></Footer>
    </div>
  );
}
