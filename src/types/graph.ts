
export interface DatabaseNode {
  id: string;
  name: string;
  type: "database" | "page" | "property";
  category: string;
  description?: string;
  size: number;
  propertyType?: string;
  parentDatabase?: string;
}

export interface DatabaseConnection {
  source: string;
  target: string;
  type: "relation" | "reference" | "dependency" | "contains";
  strength: number;
  label?: string;
}

