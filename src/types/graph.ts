
import * as d3 from 'd3';

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

// Add the missing GraphNode and GraphLink interfaces for D3.js compatibility
export interface GraphNode extends d3.SimulationNodeDatum {
  id: string;
  label: string;
  type?: string;
  category?: string;
  x?: number;
  y?: number;
}

export interface GraphLink extends d3.SimulationLinkDatum<GraphNode> {
  source: string | GraphNode;
  target: string | GraphNode;
  type?: string;
  strength?: number;
  label?: string;
}
