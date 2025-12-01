export type ClickSuggestion = {
  _id: string;
  userId: string;
  category: string;
  color: string;
  clickCount: number;
  lastClickedAt: string;
};

export type ClickSuggestionPayload = {
  userId: string;
  category: string;
  color: string;
};
