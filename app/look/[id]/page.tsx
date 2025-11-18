"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import LookCard from "../../Components/LookCard/LookCard";
import styles from "./lookId.module.css";
import { LookType } from "@/types/lookTypes";

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
    <div className={styles.container}>
      <LookCard items={look.items } lookId={look._id} />
    </div>
  );
};

export default LookPage;
