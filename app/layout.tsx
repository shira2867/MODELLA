"use client";
import "./globals.css";
import { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import { ToastProvider } from "../app/Components/Toast/ToastProvider";
const queryClient = new QueryClient();

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    document.title = "modella.life";
  }, []);
  return (
    <html lang="en">
      <body>
        <QueryClientProvider client={queryClient}>
          <ToastProvider>{children}</ToastProvider>
        </QueryClientProvider>
      </body>
    </html>
  );
}
