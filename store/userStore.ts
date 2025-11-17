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
  setUser: (user: User) => void;
  setUserId: (id: string | null) => void;
  clearUser: () => void;
}

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      user: null,
      userId: null,

      setUser: (user) => set({ user }),
      setUserId: (id) => {
        set({ userId: id });
        if (id) {
          localStorage.setItem("userId", id); 
        } else {
          localStorage.removeItem("userId"); 
        }
      },

      clearUser: () => {
        set({ user: null, userId: null });
        localStorage.removeItem("userId"); 
      },
    }),
    {
      name: "user-storage",
    }
  )
);
