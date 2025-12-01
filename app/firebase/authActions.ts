import { signOut } from "firebase/auth";
import { auth } from "./config";
import { useUserStore } from "@/store/userStore";

export function signOutUser() {
  return signOut(auth)
    .then(() => {
      useUserStore.getState().clearUser();
    })
    .catch(console.error);
}
