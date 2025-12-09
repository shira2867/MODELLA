
import { Suspense } from "react";
import Welcome from "../Components/Welcome/Welcome";

export default function WelcomePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Welcome />
    </Suspense>
  );
}
