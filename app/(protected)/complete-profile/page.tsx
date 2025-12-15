"use client";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../../firebase/config"; 
import CompleteProfile from "../../Components/CompleteProfile/CompleteProfile";

export default function CompleteProfilePage() {
  const [user] = useAuthState(auth);

  if (!user) return <p>Loading...</p>;

  return <CompleteProfile  />;
}
