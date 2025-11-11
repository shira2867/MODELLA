// app/home/page.tsx
import MyCloset from "@/app/Components/MyCloset/MyCloset";
export default function ShowMyCloset() {
  const userId = "123"; // כאן תמשכי את ה-userId מהסשן או פרופ

  return (
    <div style={{ padding: "2rem" }}>
      <MyCloset userId={userId} />
    </div>
  );
}
