 export type FormData = {
  email: string;
  password: string;
};
export type UserType = {
  _id?: string;
  name?: string;
  email: string;
  passwordHash?: string;
  profileImage?: string;
  gender?: "male" | "female";
  createdAt?: Date;
};

export type ProfileData = {
  name: string;
  gender: string;
  profileImage?: string;
};