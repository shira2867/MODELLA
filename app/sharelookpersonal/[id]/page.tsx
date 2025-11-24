"use client";

import Header from "@/app/Components/Header/Header";
import Footer from "@/app/Components/Footer/Footer";
import BuildSimilarLook from "@/app/Components/LookCreator/LookCreator";

export default function ShareLookPersonalPage() {
  return (
    <div>
      <Header />
      <main>
        <BuildSimilarLook />
      </main>
      <Footer />
    </div>
  );
}
