
import { GraphNode, GraphConnection } from '@/hooks/useGraphData';

export const sampleNodes: GraphNode[] = [
  {
    id: '1',
    name: 'Getting Started',
    category: 'Documentation',
    description: 'Introduction to the knowledge graph system',
    color: '#3b82f6',
    x: 100,
    y: 100
  },
  {
    id: '2',
    name: 'Data Sources',
    category: 'Integration',
    description: 'Available data sources and connections',
    color: '#10b981',
    x: 300,
    y: 100
  },
  {
    id: '3',
    name: 'Visualization',
    category: 'UI/UX',
    description: 'Graph visualization components',
    color: '#f59e0b',
    x: 200,
    y: 300
  },
  {
    id: '4',
    name: 'Settings',
    category: 'Configuration',
    description: 'System configuration and preferences',
    color: '#ef4444',
    x: 400,
    y: 200
  }
];

export const sampleConnections: GraphConnection[] = [
  {
    id: 'conn1',
    source: '1',
    target: '2',
    label: 'leads to',
    strength: 0.8,
    color: '#6b7280'
  },
  {
    id: 'conn2',
    source: '2',
    target: '3',
    label: 'enables',
    strength: 0.9,
    color: '#6b7280'
  },
  {
    id: 'conn3',
    source: '1',
    target: '4',
    label: 'configures',
    strength: 0.6,
    color: '#6b7280'
  },
  {
    id: 'conn4',
    source: '4',
    target: '3',
    label: 'customizes',
    strength: 0.7,
    color: '#6b7280'
  }
];
