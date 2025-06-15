
import { GraphNode, GraphConnection } from '@/hooks/useGraphData';
import { DatabaseNode, DatabaseConnection } from '@/types/graph';

export const convertGraphNodeToDatabase = (node: GraphNode): DatabaseNode => {
  return {
    id: node.id,
    name: node.name,
    type: "page", // Default type, can be customized based on node data
    category: node.category,
    description: node.description,
    size: 10, // Default size, can be calculated based on connections or other metrics
    propertyType: undefined,
    parentDatabase: undefined,
  };
};

export const convertGraphConnectionToDatabase = (connection: GraphConnection): DatabaseConnection => {
  return {
    source: connection.source,
    target: connection.target,
    type: "relation", // Default type, can be customized based on connection data
    strength: connection.strength || 0.5,
    label: connection.label,
  };
};

export const convertGraphNodesToDatabase = (nodes: GraphNode[]): DatabaseNode[] => {
  return nodes.map(convertGraphNodeToDatabase);
};

export const convertGraphConnectionsToDatabase = (connections: GraphConnection[]): DatabaseConnection[] => {
  return connections.map(convertGraphConnectionToDatabase);
};
