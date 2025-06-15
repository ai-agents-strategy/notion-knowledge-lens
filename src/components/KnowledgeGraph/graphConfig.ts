
import { DatabaseConnection } from "@/types/graph";

// Notion-inspired color palette
export const categoryColors: Record<string, string> = {
  database: "#2383e2", // Notion blue
  text: "#0f7b6c", // Notion teal
  number: "#dfab01", // Notion yellow
  select: "#9b51e0", // Notion purple
  multi_select: "#dd0081", // Notion pink
  date: "#eb5757", // Notion red
  person: "#17a5a5", // Notion teal variant
  file: "#0d8b7b", // Notion green
  checkbox: "#d9730d", // Notion orange
  url: "#2383e2", // Notion blue
  email: "#0f7b6c", // Notion teal
  phone_number: "#9b51e0", // Notion purple
  formula: "#dfab01", // Notion yellow
  relation: "#eb5757", // Notion red
  rollup: "#9b51e0", // Notion purple
  created_time: "#0d8b7b", // Notion green
  created_by: "#17a5a5", // Notion teal
  last_edited_time: "#8b4513", // Brown
  last_edited_by: "#8b4513", // Brown
  // Categories
  seo: "#2383e2",
  content: "#0d8b7b",
  technical: "#9b51e0",
  offpage: "#dfab01",
  local: "#eb5757",
  ecommerce: "#dd0081",
  mobile: "#17a5a5",
  analytics: "#d9730d",
  research: "#6366f1",
  work: "#2383e2",
  contacts: "#0d8b7b",
  knowledge: "#9b51e0",
  planning: "#dfab01",
  finance: "#eb5757",
  creativity: "#dd0081",
};

export const connectionColors: Record<DatabaseConnection['type'], string> = {
  relation: "#eb5757", // Notion red
  reference: "#0d8b7b", // Notion green
  dependency: "#dfab01", // Notion yellow
  contains: "#2383e2", // Notion blue
};
