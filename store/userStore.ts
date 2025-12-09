import { create } from "zustand";
import { persist } from "zustand/middleware";

interface User {
  name: string | null;
  email: string | null;
  profileImage: string | null;
  gender: "male" | "female" | null;
}

interface UserStore {
  user: User | null;
  userId: string | null;
  setUser: (user: User | null) => void;
  setUserId: (id: string | null) => void;
  clearUser: () => void;
}

function setUserIdCookie(id: string | null) {
  if (typeof document === "undefined") return;

  if (id) {
    document.cookie = `userId=${id}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
  } else {
    document.cookie = `userId=; path=/; max-age=0; SameSite=Lax`;
  }
}

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      user: null,
      userId: null,

      setUser: (user) => {
        console.log("ZUSTAND setUser called with:", user);
        set({ user });
      },

      setUserId: (id) => {
        set({ userId: id });

        if (id) {
          localStorage.setItem("userId", id);
        } else {
          localStorage.removeItem("userId");
        }

        setUserIdCookie(id);
      },

      clearUser: () => {
        set({ user: null, userId: null });

        localStorage.removeItem("userId");

        setUserIdCookie(null);
      },
    }),
    {
      name: "user-storage",
    }
  )
);
