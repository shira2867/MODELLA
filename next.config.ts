import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com", // אם את משתמשת גם ב-Cloudinary
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com", // זה מוסיף תמונות מה-Google Profile
      },
    ],
  },
};

export default nextConfig;
