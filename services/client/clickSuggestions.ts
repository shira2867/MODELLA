import axios from "axios";

export async function updateClick(
  category: string,
  color: string
) {
  const res = await axios.post("/api/clickSuggestions", {
    category,
    color,
  });

  return res.data;
}

export async function getClicks() {
  const res = await axios.get("/api/clickSuggestions");
  return res.data;
}
