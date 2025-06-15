
import { DatabaseConnection } from "@/types/graph";

// Notion-inspired color palette with more categories
export const categoryColors: Record<string, string> = {
  // Original property types
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
  
  // Sample categories
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
  
  // Common Notion database names (lowercase with underscores)
  tasks: "#2383e2",
  projects: "#0d8b7b",
  notes: "#9b51e0",
  meetings: "#dfab01",
  clients: "#eb5757",
  resources: "#dd0081",
  bookmarks: "#17a5a5",
  ideas: "#d9730d",
  goals: "#6366f1",
  habits: "#2383e2",
  journal: "#0d8b7b",
  recipes: "#9b51e0",
  books: "#dfab01",
  movies: "#eb5757",
  travel: "#dd0081",
  expenses: "#17a5a5",
  inventory: "#d9730d",
  leads: "#6366f1",
  candidates: "#2383e2",
  documents: "#0d8b7b",
  events: "#9b51e0",
  courses: "#dfab01",
  templates: "#eb5757",
  archives: "#dd0081",
  
  // Handle spaces and mixed case variations
  "task_management": "#2383e2",
  "project_tracker": "#0d8b7b",
  "meeting_notes": "#9b51e0",
  "client_database": "#dfab01",
  "resource_library": "#eb5757",
  "bookmark_collection": "#dd0081",
  "idea_board": "#17a5a5",
  "goal_tracker": "#d9730d",
  "habit_tracker": "#6366f1",
  "daily_journal": "#2383e2",
  "recipe_book": "#0d8b7b",
  "book_list": "#9b51e0",
  "movie_list": "#dfab01",
  "travel_plans": "#eb5757",
  "expense_tracker": "#dd0081",
  "inventory_system": "#17a5a5",
  "lead_tracker": "#d9730d",
  "candidate_pipeline": "#6366f1",
  "document_library": "#2383e2",
  "event_planning": "#0d8b7b",
  "course_materials": "#9b51e0",
  "template_library": "#dfab01",
  "archive_storage": "#eb5757",
};

// Array of fallback colors for unknown categories
export const fallbackColors = [
  "#2383e2", "#0d8b7b", "#9b51e0", "#dfab01", "#eb5757", 
  "#dd0081", "#17a5a5", "#d9730d", "#6366f1", "#8b4513"
];

export const connectionColors: Record<DatabaseConnection['type'], string> = {
  relation: "#eb5757", // Notion red
  reference: "#0d8b7b", // Notion green
  dependency: "#dfab01", // Notion yellow
  contains: "#2383e2", // Notion blue
};

// Helper function to get color for a category
export const getCategoryColor = (category: string): string => {
  const normalizedCategory = category.toLowerCase().replace(/\s+/g, '_');
  
  // Try exact match first
  if (categoryColors[normalizedCategory]) {
    return categoryColors[normalizedCategory];
  }
  
  // Try partial matches for common patterns
  for (const [key, color] of Object.entries(categoryColors)) {
    if (normalizedCategory.includes(key) || key.includes(normalizedCategory)) {
      return color;
    }
  }
  
  // Use hash-based fallback color for consistency
  let hash = 0;
  for (let i = 0; i < normalizedCategory.length; i++) {
    const char = normalizedCategory.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  
  return fallbackColors[Math.abs(hash) % fallbackColors.length];
};
