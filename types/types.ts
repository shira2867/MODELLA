 export type RouteContext = {
  params: Promise<{ id: string }>
};


export type StepProps = {
  title: string;
  description: string;
  imageUrl?: string;
  reverse?: boolean;
};