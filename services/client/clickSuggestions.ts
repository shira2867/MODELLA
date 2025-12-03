import axios from "axios";

export async function updateClick(
  userId: string,
  category: string,
  color: string
) {
  const res = await axios.post("/api/clickSuggestions", {
    userId,
    category,
    color,
  });

  return res.data;
}

export async function getClicks(userId: string) {
  const res = await axios.get(`/api/clickSuggestions?userId=${userId}`);
  return res.data;
}
