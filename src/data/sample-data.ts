
import { GraphNode, GraphConnection } from '@/hooks/useGraphData';

export const sampleNodes: GraphNode[] = [
  {
    id: '1',
    name: 'Keyword Research',
    label: 'Keywords',
    category: 'SEO Strategy',
    description: 'Identifying valuable keywords to primary/secondary target',
    color: '#3b82f6',
    x: 100,
    y: 200
  },
  {
    id: '2',
    name: 'On-Page SEO',
    label: 'On-Page',
    category: 'Content Optimization',
    description: 'Optimizing individual web pages to rank higher',
    color: '#10b981',
    x: 300,
    y: 100
  },
  {
    id: '3',
    name: 'Link Building',
    label: 'Backlinks',
    category: 'Off-Page SEO',
    description: 'Acquiring backlinks from other websites',
    color: '#f59e0b',
    x: 300,
    y: 300
  },
  {
    id: '4',
    name: 'Technical SEO',
    label: 'Technical',
    category: 'Website Optimization',
    description: 'Improving the technical aspects of a website',
    color: '#ef4444',
    x: 500,
    y: 100
  },
  {
    id: '5',
    name: 'Content Creation',
    label: 'Content',
    category: 'Content Strategy',
    description: 'Writing and publishing content to attract users',
    color: '#8b5cf6',
    x: 100,
    y: 400
  },
  {
    id: '6',
    name: 'Analytics & Reporting',
    label: 'Analytics',
    category: 'Measurement',
    description: 'Tracking and analyzing SEO performance',
    color: '#6366f1',
    x: 500,
    y: 300
  },
  {
    id: '7',
    name: 'Local SEO',
    label: 'Local',
    category: 'Specialized SEO',
    description: 'Optimizing for local search results',
    color: '#ec4899',
    x: 300,
    y: 500
  },
  {
    id: '8',
    name: 'E-commerce SEO',
    label: 'E-commerce',
    category: 'Specialized SEO',
    description: 'SEO for online stores and product pages',
    color: '#f97316',
    x: 100,
    y: 600
  },
  {
    id: '9',
    name: 'Mobile SEO',
    label: 'Mobile',
    category: 'Technical SEO',
    description: 'Optimizing for mobile devices',
    color: '#6ee7b7',
    x: 500,
    y: -100
  },
  {
    id: '10',
    name: 'Voice Search SEO',
    label: 'Voice',
    category: 'Emerging SEO',
    description: 'Optimizing for voice-based search queries',
    color: '#a78bfa',
    x: -100,
    y: 300
  },
  {
    id: '11',
    name: 'Google Business Profile',
    label: 'GBP',
    category: 'Local SEO',
    description: 'Managing and optimizing Google Business Profile listing',
    color: '#d946ef',
    x: 450,
    y: 600
  },
  {
    id: '12',
    name: 'Local Citations',
    label: 'Citations',
    category: 'Local SEO',
    description: 'Building consistent NAP (Name, Address, Phone) citations',
    color: '#f472b6',
    x: 150,
    y: 600
  },
  {
    id: '13',
    name: 'Online Reviews & Ratings',
    label: 'Reviews',
    category: 'Local SEO',
    description: 'Managing and encouraging customer reviews',
    color: '#fb923c',
    x: 450,
    y: 450
  },
  {
    id: '14',
    name: 'Localized Content',
    label: 'Local Content',
    category: 'Local SEO',
    description: 'Creating content relevant to the local audience',
    color: '#a855f7',
    x: 150,
    y: 450
  },
  {
    id: '15',
    name: 'GBP Optimization',
    label: 'GBP Opt.',
    category: 'Google Business Profile',
    description: 'Optimizing profile info, categories, and attributes',
    color: '#c026d3',
    x: 600,
    y: 700
  },
  {
    id: '16',
    name: 'GBP Posts',
    label: 'GBP Posts',
    category: 'Google Business Profile',
    description: 'Creating posts for updates, offers, and events',
    color: '#c026d3',
    x: 300,
    y: 700
  },
  {
    id: '17',
    name: 'Review Generation',
    label: 'Get Reviews',
    category: 'Online Reviews & Ratings',
    description: 'Strategies to encourage customers to leave reviews',
    color: '#f97316',
    x: 600,
    y: 400
  },
  {
    id: '18',
    name: 'Review Response',
    label: 'Reply Reviews',
    category: 'Online Reviews & Ratings',
    description: 'Responding to both positive and negative customer reviews',
    color: '#f97316',
    x: 300,
    y: 400
  },
  {
    id: '19',
    name: 'Local Landing Pages',
    label: 'Local Pages',
    category: 'Localized Content',
    description: 'Creating specific landing pages for each business location',
    color: '#9333ea',
    x: 0,
    y: 550
  },
  {
    id: '20',
    name: 'Citation Building',
    label: 'Build Citations',
    category: 'Local Citations',
    description: 'Actively creating new citations on relevant directories',
    color: '#db2777',
    x: 0,
    y: 700
  }
];

export const sampleConnections: GraphConnection[] = [
  {
    id: 'conn1',
    source: '1',
    target: '2',
    label: 'informs',
    strength: 0.9,
    color: '#6b7280'
  },
  {
    id: 'conn2',
    source: '2',
    target: '3',
    label: 'supports',
    strength: 0.7,
    color: '#6b7280'
  },
  {
    id: 'conn3',
    source: '4',
    target: '2',
    label: 'enhances',
    strength: 0.8,
    color: '#6b7280'
  },
  {
    id: 'conn4',
    source: '1',
    target: '5',
    label: 'drives',
    strength: 0.9,
    color: '#6b7280'
  },
  {
    id: 'conn5',
    source: '5',
    target: '3',
    label: 'enables',
    strength: 0.8,
    color: '#6b7280'
  },
  {
    id: 'conn6',
    source: '6',
    target: '1',
    label: 'refines',
    strength: 0.7,
    color: '#6b7280'
  },
  {
    id: 'conn7',
    source: '6',
    target: '5',
    label: 'measures',
    strength: 0.9,
    color: '#6b7280'
  },
  {
    id: 'conn8',
    source: '4',
    target: '9',
    label: 'includes',
    strength: 0.9,
    color: '#6b7280'
  },
  {
    id: 'conn9',
    source: '2',
    target: '7',
    label: 'optimizes for',
    strength: 0.8,
    color: '#6b7280'
  },
  {
    id: 'conn10',
    source: '2',
    target: '8',
    label: 'optimizes for',
    strength: 0.8,
    color: '#6b7280'
  },
  {
    id: 'conn11',
    source: '1',
    target: '10',
    label: 'adapts for',
    strength: 0.7,
    color: '#6b7280'
  },
  {
    id: 'conn12',
    source: '6',
    target: '4',
    label: 'monitors',
    strength: 0.8,
    color: '#6b7280'
  },
  {
    id: 'conn13',
    source: '7',
    target: '11',
    label: 'manages',
    strength: 0.9,
    color: '#6b7280'
  },
  {
    id: 'conn14',
    source: '7',
    target: '12',
    label: 'builds',
    strength: 0.8,
    color: '#6b7280'
  },
  {
    id: 'conn15',
    source: '7',
    target: '13',
    label: 'monitors',
    strength: 0.8,
    color: '#6b7280'
  },
  {
    id: 'conn16',
    source: '7',
    target: '14',
    label: 'creates',
    strength: 0.9,
    color: '#6b7280'
  },
  {
    id: 'conn17',
    source: '5',
    target: '14',
    label: 'is type of',
    strength: 0.7,
    color: '#6b7280'
  },
  {
    id: 'conn18',
    source: '6',
    target: '13',
    label: 'tracks',
    strength: 0.7,
    color: '#6b7280'
  },
  {
    id: 'conn19',
    source: '11',
    target: '15',
    label: 'involves',
    strength: 0.9,
    color: '#6b7280'
  },
  {
    id: 'conn20',
    source: '11',
    target: '16',
    label: 'involves',
    strength: 0.8,
    color: '#6b7280'
  },
  {
    id: 'conn21',
    source: '13',
    target: '17',
    label: 'involves',
    strength: 0.9,
    color: '#6b7280'
  },
  {
    id: 'conn22',
    source: '13',
    target: '18',
    label: 'involves',
    strength: 0.9,
    color: '#6b7280'
  },
  {
    id: 'conn23',
    source: '14',
    target: '19',
    label: 'produces',
    strength: 0.9,
    color: '#6b7280'
  },
  {
    id: 'conn24',
    source: '12',
    target: '20',
    label: 'involves',
    strength: 0.9,
    color: '#6b7280'
  }
];
