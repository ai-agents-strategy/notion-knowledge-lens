import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { GraphNode, GraphLink } from '@/types/graph';

interface KnowledgeGraphProps {
  nodes: GraphNode[];
  links: GraphLink[];
  onNodeClick?: (node: GraphNode) => void;
  onNodeHover?: (node: GraphNode | null) => void;
  hoveredNode?: GraphNode | null;
  width?: number;
  height?: number;
}

const KnowledgeGraph: React.FC<KnowledgeGraphProps> = ({
  nodes,
  links,
  onNodeClick,
  onNodeHover,
  hoveredNode,
  width = 800,
  height = 600,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [simulation, setSimulation] = useState<d3.Simulation<GraphNode, GraphLink> | null>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove(); // Clear previous graph

    const currentSimulation = d3.forceSimulation<GraphNode, GraphLink>(nodes)
      .force("link", d3.forceLink(links).id(d => (d as GraphNode).id).distance(100))
      .force("charge", d3.forceManyBody().strength(-150))
      .force("center", d3.forceCenter(width / 2, height / 2));

    setSimulation(currentSimulation);

    const linkElements = svg.append("g")
      .attr("class", "links")
      .selectAll("line")
      .data(links)
      .enter().append("line")
      .attr("stroke", "#999")
      .attr("stroke-opacity", 0.6);

    const nodeElements = svg.append("g")
      .attr("class", "nodes")
      .selectAll("circle")
      .data(nodes)
      .enter().append("circle")
      .attr("r", 20)
      .attr("fill", "skyblue")
      .style("cursor", "pointer")
      .on("click", (event, d) => {
        onNodeClick?.(d);
      })
      .on("mouseover", (event, d) => {
        onNodeHover?.(d);
      })
      .on("mouseout", () => {
        onNodeHover?.(null);
      });

    // Add labels to nodes
    const labels = svg.append("g")
      .attr("class", "labels")
      .selectAll("text")
      .data(nodes)
      .enter().append("text")
      .attr("text-anchor", "middle")
      .attr("alignment-baseline", "middle")
      .style("font-size", "10px")
      .style("fill", "black")
      .style("pointer-events", "none") // Prevent labels from interfering with node interactions
      .text(d => d.label);

    currentSimulation.on("tick", () => {
      linkElements
        .attr("x1", d => (d.source as GraphNode).x!)
        .attr("y1", d => (d.source as GraphNode).y!)
        .attr("x2", d => (d.target as GraphNode).x!)
        .attr("y2", d => (d.target as GraphNode).y!);

      nodeElements
        .attr("cx", d => d.x!)
        .attr("cy", d => d.y!);

      labels
        .attr("x", d => d.x!)
        .attr("y", d => d.y!);
    });

    // Node highlighting
    useEffect(() => {
      if (hoveredNode) {
        nodeElements.attr("fill", (d) => (d.id === hoveredNode.id ? "red" : "skyblue"));
      } else {
        nodeElements.attr("fill", "skyblue");
      }
    }, [hoveredNode, nodeElements]);

    return () => {
      currentSimulation.stop();
    };

  }, [nodes, links, onNodeClick, onNodeHover, width, height, hoveredNode]);

  return (
    <svg ref={svgRef} width={width} height={height}></svg>
  );
};

export default KnowledgeGraph;
