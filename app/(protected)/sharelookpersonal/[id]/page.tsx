"use client";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";
import Header from "@/app/Components/Header/Header";
import Footer from "@/app/Components/Footer/Footer";
import BuildSimilarLook from "@/app/Components/LookCreator/LookCreator";

export default function ShareLookPersonalPage() {
  const router = useRouter();
  const params = useParams(); 
  const lookIdParam = params?.id;
  const lookId = Array.isArray(lookIdParam) ? lookIdParam[0] : (lookIdParam ?? "");
  


  const { data: look, isLoading, error } = useQuery({
    queryKey: ["look", lookId],
    queryFn: async () => {
      const res = await axios.get(`/api/looks/${lookId}`);
      return res.data;
    },
    enabled: !!lookId,
  });
    // ✅ client-side fallback redirect on unauthorized
  if (axios.isAxiosError(error) && (error.response?.status === 401 || error.response?.status === 403)) {
    router.replace(`/welcome?next=${encodeURIComponent(`/sharelookpersonal/${lookId}`)}`);
    return null;
  }

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
