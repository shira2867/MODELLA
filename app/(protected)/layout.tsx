"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/store/userStore";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  const userId = useUserStore((state) => state.userId);

  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return; 

    if (!userId) {
      router.push("/welcome");
    }
  }, [hydrated, userId, router]);

  if (!hydrated) return null;

  if (!userId) return null;

  return <>{children}</>;
}
