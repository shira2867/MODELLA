// app/add-item/page.tsx
import NewCloth from "@/app/Components/NewCloth/NewCloth";

export default function AddItemPage() {
  const userId = "123"; // כאן תמשכי את ה-userId מהסשן או פרופס

  return (
    <div style={{ padding: "2rem" }}>
      <NewCloth userId={userId} />
    </div>
  );
}
