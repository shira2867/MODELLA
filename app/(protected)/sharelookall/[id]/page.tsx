"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation"; 
import axios from "axios";
import Header from "@/app/Components/Header/Header";
import Footer from "@/app/Components/Footer/Footer";
import BuildSimilarLook from "@/app/Components/LookCreator/LookCreator";

export default function ShareLookAllPage() {
  const params = useParams(); 
  let shareId = params?.id || ""; 
  const { data: look, isLoading, error } = useQuery({
    queryKey: ["shareLook", shareId],
    queryFn: async () => {
      const res = await axios.get(`/api/sharelook/${shareId}`);
      return res.data;
    },
    enabled: !!shareId,
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
