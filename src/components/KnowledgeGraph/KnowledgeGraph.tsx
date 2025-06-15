import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { DatabaseNode, DatabaseConnection } from "@/types/graph";
import { GraphLegend } from "./GraphLegend";
import { HoveredNodeDetails } from "./HoveredNodeDetails";
import { GraphControls } from "./GraphControls";

interface KnowledgeGraphProps {
  nodes: DatabaseNode[];
  connections: DatabaseConnection[];
  showConnectionLabels: boolean;
}

// Notion-inspired color palette
const categoryColors: Record<string, string> = {
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

const connectionColors: Record<DatabaseConnection['type'], string> = {
  relation: "#eb5757", // Notion red
  reference: "#0d8b7b", // Notion green
  dependency: "#dfab01", // Notion yellow
  contains: "#2383e2", // Notion blue
};

export const KnowledgeGraph = ({ nodes, connections, showConnectionLabels }: KnowledgeGraphProps) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const graphContainerRef = useRef<HTMLDivElement>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => {
    if (!graphContainerRef.current) return;

    if (!document.fullscreenElement) {
      graphContainerRef.current.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  useEffect(() => {
    if (!svgRef.current || nodes.length === 0) {
        if (svgRef.current) {
            d3.select(svgRef.current).selectAll("*").remove();
        }
        return;
    }

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const container = svgRef.current.parentElement;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    svg.attr("width", width).attr("height", height);

    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
      });

    svg.call(zoom);
    const g = svg.append("g");

    const simulation = d3.forceSimulation(nodes as d3.SimulationNodeDatum[])
      .force("link", d3.forceLink<d3.SimulationNodeDatum, DatabaseConnection>(connections).id((d: any) => d.id)
        .distance((d: any) => {
          if (d.type === 'contains') return 60;
          if (d.type === 'relation') return 150;
          return 100;
        })
      )
      .force("charge", d3.forceManyBody()
        .strength((d: any) => {
          if (d.type === 'database') return -400;
          if (d.type === 'property') return -150;
          return -300;
        })
      )
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide()
        .radius((d: any) => {
          if (d.type === 'database') return d.size + 10;
          if (d.type === 'property') return d.size + 5;
          return d.size + 5;
        })
      );

    const defs = g.append("defs");
    connections.forEach((conn, i) => {
      const gradient = defs.append("linearGradient")
        .attr("id", `gradient-${i}`)
        .attr("gradientUnits", "userSpaceOnUse");
      
      gradient.append("stop")
        .attr("offset", "0%")
        .attr("stop-color", connectionColors[conn.type] || "#a8a6a1")
        .attr("stop-opacity", 0.8);
      
      gradient.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", connectionColors[conn.type] || "#a8a6a1")
        .attr("stop-opacity", 0.2);
    });

    const links = g.append("g")
      .selectAll("line")
      .data(connections)
      .enter()
      .append("line")
      .attr("stroke", (d, i) => `url(#gradient-${i})`)
      .attr("stroke-width", d => {
        if (d.type === 'contains') return 2;
        if (d.type === 'relation') return Math.max(2, d.strength * 5);
        return Math.max(1, d.strength * 4);
      })
      .attr("stroke-opacity", d => d.type === 'contains' ? 0.8 : 0.6)
      .attr("stroke-dasharray", d => d.type === 'reference' ? "5,5" : null);

    const linkLabels = g.append("g")
      .selectAll("text")
      .data(connections)
      .enter()
      .append("text")
      .attr("font-size", "9px")
      .attr("fill", "#000000")
      .attr("text-anchor", "middle")
      .attr("dy", -5)
      .style("opacity", showConnectionLabels ? 0.7 : 0)
      .text(d => d.label || "");

    const nodeGroups = g.append("g")
      .selectAll<SVGGElement, DatabaseNode>("g")
      .data(nodes)
      .enter()
      .append("g")
      .style("cursor", "grab")
      .call(d3.drag<SVGGElement, DatabaseNode & d3.SimulationNodeDatum>()
        .on("start", (event, d) => {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
        })
        .on("drag", (event, d) => {
          d.fx = event.x;
          d.fy = event.y;
        })
        .on("end", (event, d) => {
          if (!event.active) simulation.alphaTarget(0);
          d.fx = null;
          d.fy = null;
        }));
    
    const filter = defs.append("filter")
      .attr("id", "glow");
    filter.append("feGaussianBlur")
      .attr("stdDeviation", "3")
      .attr("result", "coloredBlur");
    const feMerge = filter.append("feMerge");
    feMerge.append("feMergeNode").attr("in", "coloredBlur");
    feMerge.append("feMergeNode").attr("in", "SourceGraphic");

    nodeGroups.each(function(d) {
      const group = d3.select(this);
      const color = categoryColors[d.category.toLowerCase()] || categoryColors[d.type] || "#6b7280";
      
      if (d.type === 'database' || d.type === 'page') {
        group.append("circle")
          .attr("r", d.size)
          .attr("fill", color)
          .attr("stroke", "#1e293b")
          .attr("stroke-width", 3)
          .style("filter", "url(#glow)")
          .style("opacity", 0.9);
      } else if (d.type === 'property') {
        group.append("rect")
          .attr("width", d.size * 2)
          .attr("height", d.size)
          .attr("x", -d.size)
          .attr("y", -d.size / 2)
          .attr("rx", 4)
          .attr("fill", color)
          .attr("stroke", "#1e293b")
          .attr("stroke-width", 1)
          .style("opacity", 0.8);
      }
    });

    nodeGroups.append("text")
      .attr("text-anchor", "middle")
      .attr("dy", d => (d.type === 'database' || d.type === 'page') ? 5 : 3)
      .attr("font-size", d => (d.type === 'database' || d.type === 'page') ? "12px" : "9px")
      .attr("font-weight", d => (d.type === 'database' || d.type === 'page') ? "bold" : "normal")
      .attr("fill", "#000000")
      .text(d => {
        if (d.type === 'property' && d.name.length > 12) {
          return d.name.substring(0, 12) + '...';
        }
        return d.name;
      });

    nodeGroups
      .on("mouseenter", (event, d) => {
        setHoveredNode(d.id);
        const element = d3.select(event.currentTarget);
        
        if (d.type === 'database' || d.type === 'page') {
          element.select("circle")
            .transition()
            .duration(200)
            .attr("r", d.size + 5)
            .style("opacity", 1);
        } else { // property
          element.select("rect")
            .transition()
            .duration(200)
            .attr("width", d.size * 2 + 4)
            .attr("height", d.size + 2)
            .attr("x", -d.size - 2)
            .attr("y", -d.size / 2 - 1)
            .style("opacity", 1);
        }
      })
      .on("mouseleave", (event, d) => {
        setHoveredNode(null);
        const element = d3.select(event.currentTarget);
        
        if (d.type === 'database' || d.type === 'page') {
          element.select("circle")
            .transition()
            .duration(200)
            .attr("r", d.size)
            .style("opacity", 0.9);
        } else { // property
          element.select("rect")
            .transition()
            .duration(200)
            .attr("width", d.size * 2)
            .attr("height", d.size)
            .attr("x", -d.size)
            .attr("y", -d.size / 2)
            .style("opacity", 0.8);
        }
      });

    simulation.on("tick", () => {
      links
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y);

      linkLabels
        .attr("x", (d: any) => (d.source.x + d.target.x) / 2)
        .attr("y", (d: any) => (d.source.y + d.target.y) / 2);

      nodeGroups
        .attr("transform", (d: any) => `translate(${d.x},${d.y})`);
    });

    return () => {
      simulation.stop();
    };
  }, [nodes, connections, showConnectionLabels]);

  return (
    <div ref={graphContainerRef} className="relative w-full h-full bg-white dark:bg-gray-900">
      <svg ref={svgRef} className="w-full h-full" />
      
      <HoveredNodeDetails 
        nodeId={hoveredNode}
        nodes={nodes}
        categoryColors={categoryColors}
      />
      
      <GraphLegend 
        categoryColors={categoryColors}
        connectionColors={connectionColors}
      />
      
      <GraphControls 
        isFullscreen={isFullscreen}
        onToggleFullscreen={toggleFullscreen}
      />
    </div>
  );
};
