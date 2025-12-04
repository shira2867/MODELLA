"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";
import LookCard from "../../../Components/LookCard/LookCard";
import { LookType } from "@/types/lookTypes";
import Header from "@/app/Components/Header/Header";
import Footer from "@/app/Components/Footer/Footer";

const LookPage = () => {
  const params = useParams();
  const lookId = params?.id;

  const [look, setLook] = useState<LookType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!lookId) return;

    const fetchLook = async () => {
      try {
        const res = await axios.get(`/api/looks/${lookId}`);
        setLook(res.data);
      } catch (err) {
        console.error("Failed to fetch look:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLook();
  }, [lookId]);

  if (loading) return <p>Loading...</p>;
  if (!look) return <p>Look not found</p>;

  return (
    <div>
      <Header />
      <LookCard items={look.items} lookId={look._id} />
      <Footer />
    </div>
  );
};

export default LookPage;
