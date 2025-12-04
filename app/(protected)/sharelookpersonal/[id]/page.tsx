"use client";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useParams } from "next/navigation";
import Header from "@/app/Components/Header/Header";
import Footer from "@/app/Components/Footer/Footer";
import BuildSimilarLook from "@/app/Components/LookCreator/LookCreator";

export default function ShareLookPersonalPage() {
  const params = useParams(); 
  const lookId = params?.id || "";

  const { data: look, isLoading, error } = useQuery({
    queryKey: ["look", lookId],
    queryFn: async () => {
      const res = await axios.get(`/api/looks/${lookId}`);
      return res.data;
    },
    enabled: !!lookId,
  });

  if (isLoading) return <p>Loading...</p>;
  if (error || !look) return <p>Look not found</p>;

  return (
    <div>
      <Header />
      <main>
        <BuildSimilarLook look={look} />
      </main>
      <Footer />
    </div>
  );
}
