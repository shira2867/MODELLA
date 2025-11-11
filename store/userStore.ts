import { create } from "zustand";

interface User {
  name: string | null;
  email: string | null;
  profileImage: string | null;
  gender: "male" | "female" | null;
}

interface UserStore {
  user: User | null;
  setUser: (user: User) => void;
  clearUser: () => void;
}

export const useUserStore = create<UserStore>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  clearUser: () => set({ user: null }),
}));
