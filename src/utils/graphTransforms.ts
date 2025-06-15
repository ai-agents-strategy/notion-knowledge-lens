import { DatabaseNode, DatabaseConnection, GraphNode, GraphLink } from '@/types/graph';

export const transformDatabaseNodeToGraphNode = (node: DatabaseNode): GraphNode => {
  return {
    id: node.id,
    label: node.name, // Map 'name' to 'label'
    type: node.type,
    category: node.category,
    // Keep x and y as optional since they'll be set by D3
  };
};

export const transformDatabaseConnectionToGraphLink = (connection: DatabaseConnection): GraphLink => {
  return {
    source: connection.source,
    target: connection.target,
    type: connection.type,
    strength: connection.strength,
    label: connection.label,
  };
};

export const transformGraphData = (nodes: DatabaseNode[], connections: DatabaseConnection[]) => {
  return {
    graphNodes: nodes.map(transformDatabaseNodeToGraphNode),
    graphLinks: connections.map(transformDatabaseConnectionToGraphLink)
  };
};
