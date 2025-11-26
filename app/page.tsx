import { Suspense } from "react";
import Welcome from "./welcome/page";

export default function Home() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Welcome />
    </Suspense>
  );
}
