import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as d3 from 'd3';
import { DatabaseNode, DatabaseConnection } from '@/types/graph';
import { GraphControls } from './GraphControls';
import { HoveredNodeDetails } from './HoveredNodeDetails';
import { useFullscreen } from 'usehooks-ts';

interface KnowledgeGraphProps {
  nodes: DatabaseNode[];
  connections: DatabaseConnection[];
  showConnectionLabels: boolean;
}

export const KnowledgeGraph: React.FC<KnowledgeGraphProps> = ({ nodes, connections, showConnectionLabels }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [simulation, setSimulation] = useState<d3.Simulation<DatabaseNode, undefined> | null>(null);
  const [graphNodes, setGraphNodes] = useState<DatabaseNode[]>(nodes);
  const [graphConnections, setGraphConnections] = useState<DatabaseConnection[]>(connections);
  const [hoveredNode, setHoveredNode] = useState<DatabaseNode | null>(null);
  const { isFullscreen, toggleFullscreen } = useFullscreen(document.documentElement);

  // Define color scales for node categories and connection types
  const categoryColors: Record<string, string> = {
    content: 'hsl(var(--chart-1))',
    seo: 'hsl(var(--chart-2))',
    technical: 'hsl(var(--chart-3))',
    offpage: 'hsl(var(--chart-4))',
    local: 'hsl(var(--chart-5))',
    ecommerce: 'hsl(var(--chart-1))',
    mobile: 'hsl(var(--chart-2))',
    analytics: 'hsl(var(--chart-3))',
    research: 'hsl(var(--chart-4))',
    page: 'hsl(var(--chart-1))',
    database: 'hsl(var(--chart-2))',
    property: 'hsl(var(--chart-3))',
    text: 'hsl(var(--chart-4))',
  };

  const connectionColors: Record<string, string> = {
    relation: 'rgba(107, 114, 128, 0.7)',
    dependency: 'rgba(255, 159, 67, 0.7)',
    reference: 'rgba(2, 132, 199, 0.7)',
  };

  // Update graph data when nodes or connections change
  useEffect(() => {
    setGraphNodes(nodes);
    setGraphConnections(connections);
  }, [nodes, connections]);

  // Initialize the force simulation
  useEffect(() => {
    if (!svgRef.current) return;

    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;

    const forceSimulation = d3.forceSimulation<DatabaseNode, undefined>()
      .force("link", d3.forceLink<DatabaseNode, DatabaseConnection>().id(d => d.id).distance(120))
      .force("charge", d3.forceManyBody().strength(-200))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collide", d3.forceCollide().radius(d => (d.size || 10) + 10).iterations(2))
      .force("x", d3.forceX(width / 2).strength(0.05))
      .force("y", d3.forceY(height / 2).strength(0.05));

    setSimulation(forceSimulation);

    return () => {
      forceSimulation.stop();
    };
  }, []);

  // Update simulation when graph nodes or connections change
  useEffect(() => {
    if (!simulation) return;

    simulation.nodes(graphNodes);
    simulation.force<d3.ForceLink<DatabaseNode, DatabaseConnection>>("link")
      ?.links(graphConnections);

    simulation.alpha(1).restart();

  }, [graphNodes, graphConnections, simulation]);

  // Dragging functionality
  const drag = useCallback(() => {
    if (!simulation) return {};

    const dragstarted = (event: d3.D3DragEvent<SVGCircleElement, DatabaseNode, any>, d: DatabaseNode) => {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    };

    const dragged = (event: d3.D3DragEvent<SVGCircleElement, DatabaseNode, any>, d: DatabaseNode) => {
      d.fx = event.x;
      d.fy = event.y;
    };

    const dragended = (event: d3.D3DragEvent<SVGCircleElement, DatabaseNode, any>, d: DatabaseNode) => {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    };

    return { dragstarted, dragged, dragended };
  }, [simulation]);

  useEffect(() => {
    if (!svgRef.current || !simulation) return;

    const { dragstarted, dragged, dragended } = drag();

    const nodeElements = d3.select(svgRef.current)
      .selectAll<SVGCircleElement, DatabaseNode>(".node")
      .data(graphNodes, (d: DatabaseNode) => d.id)
      .join(
        enter => enter.append("circle")
          .attr("class", "node")
          .attr("r", d => d.size || 10)
          .style("fill", d => categoryColors[d.category] || "#ccc")
          .call(d3.drag<SVGCircleElement, DatabaseNode>()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended))
          .on("mouseover", (event, d) => {
            setHoveredNode(d);
          })
          .on("mouseout", () => {
            setHoveredNode(null);
          }),
        update => update,
        exit => exit.remove()
      );

    const linkElements = d3.select(svgRef.current)
      .selectAll<SVGLineElement, DatabaseConnection>(".link")
      .data(graphConnections, (d: DatabaseConnection) => `${d.source}-${d.target}`)
      .join(
        enter => enter.append("line")
          .attr("class", "link")
          .style("stroke", d => connectionColors[d.type] || "#999")
          .style("stroke-opacity", 0.6)
          .style("stroke-width", 2),
        update => update,
        exit => exit.remove()
      );

    const labelElements = d3.select(svgRef.current)
      .selectAll<SVGTextElement, DatabaseConnection>(".link-label")
      .data(graphConnections, (d: DatabaseConnection) => `${d.source}-${d.target}`)
      .join(
        enter => enter.append("text")
          .attr("class", "link-label")
          .attr("text-anchor", "middle")
          .style("font-size", "0.7em")
          .style("fill", "#555")
          .text(d => showConnectionLabels ? d.label : ''),
        update => update
          .text(d => showConnectionLabels ? d.label : ''),
        exit => exit.remove()
      );

    simulation.on("tick", () => {
      nodeElements
        .attr("cx", d => d.x || 0)
        .attr("cy", d => d.y || 0);

      linkElements
        .attr("x1", d => (d.source as DatabaseNode).x || 0)
        .attr("y1", d => (d.source as DatabaseNode).y || 0)
        .attr("x2", d => (d.target as DatabaseNode).x || 0)
        .attr("y2", d => (d.target as DatabaseNode).y || 0);

      labelElements
        .attr("x", d => ((d.source as DatabaseNode).x || 0 + (d.target as DatabaseNode).x || 0) / 2)
        .attr("y", d => ((d.source as DatabaseNode).y || 0 + (d.target as DatabaseNode).y || 0) / 2);
    });

    return () => {
      simulation.on("tick", null);
    };
  }, [graphNodes, graphConnections, simulation, drag, showConnectionLabels, categoryColors, connectionColors]);

  const handleMouseMove = useCallback(() => {
    setHoveredNode(null);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setHoveredNode(null);
  }, []);

  return (
    <div className="relative w-full h-full overflow-hidden">
      <svg
        ref={svgRef}
        className="w-full h-full bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 cursor-move"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
      </svg>

      <GraphControls 
        isFullscreen={isFullscreen}
        onToggleFullscreen={toggleFullscreen}
        categoryColors={categoryColors}
        connectionColors={connectionColors}
      />

      {hoveredNode && (
        <HoveredNodeDetails node={hoveredNode} />
      )}
    </div>
  );
};
