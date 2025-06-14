
import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { DatabaseNode, DatabaseConnection } from "@/pages/Index";

interface KnowledgeGraphProps {
  nodes: DatabaseNode[];
  connections: DatabaseConnection[];
  showConnectionLabels: boolean;
}

export const KnowledgeGraph = ({ nodes, connections, showConnectionLabels }: KnowledgeGraphProps) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  const categoryColors = {
    database: "#3b82f6",
    text: "#10b981",
    number: "#f59e0b", 
    select: "#8b5cf6",
    multi_select: "#ec4899",
    date: "#ef4444",
    person: "#06b6d4",
    file: "#84cc16",
    checkbox: "#f97316",
    url: "#6366f1",
    email: "#14b8a6",
    phone_number: "#a855f7",
    formula: "#eab308",
    relation: "#dc2626",
    rollup: "#7c3aed",
    created_time: "#059669",
    created_by: "#0d9488",
    last_edited_time: "#7c2d12",
    last_edited_by: "#92400e",
    // Legacy categories
    work: "#3b82f6",
    contacts: "#10b981", 
    knowledge: "#8b5cf6",
    planning: "#f59e0b",
    finance: "#ef4444",
    creativity: "#ec4899",
  };

  const connectionColors = {
    relation: "#dc2626",
    reference: "#34d399", 
    dependency: "#fbbf24",
    contains: "#60a5fa",
  };

  useEffect(() => {
    if (!svgRef.current || nodes.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const container = svgRef.current.parentElement;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    svg.attr("width", width).attr("height", height);

    // Create zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
      });

    svg.call(zoom);

    const g = svg.append("g");

    // Create force simulation with different forces for different node types
    const simulation = d3.forceSimulation(nodes as any)
      .force("link", d3.forceLink(connections).id((d: any) => d.id)
        .distance((d: any) => {
          // Shorter distance for database-property connections
          if (d.type === 'contains') return 60;
          // Longer distance for database-database relations
          if (d.type === 'relation') return 150;
          return 100;
        })
      )
      .force("charge", d3.forceManyBody()
        .strength((d: any) => {
          // Databases repel more strongly
          if (d.type === 'database') return -400;
          // Properties have less repulsion
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

    // Create gradients for connections
    const defs = g.append("defs");
    connections.forEach((conn, i) => {
      const gradient = defs.append("linearGradient")
        .attr("id", `gradient-${i}`)
        .attr("gradientUnits", "userSpaceOnUse");
      
      gradient.append("stop")
        .attr("offset", "0%")
        .attr("stop-color", connectionColors[conn.type])
        .attr("stop-opacity", 0.8);
      
      gradient.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", connectionColors[conn.type])
        .attr("stop-opacity", 0.2);
    });

    // Create connections
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

    // Create connection labels
    const linkLabels = g.append("g")
      .selectAll("text")
      .data(connections)
      .enter()
      .append("text")
      .attr("font-size", "9px")
      .attr("fill", "#cbd5e1")
      .attr("text-anchor", "middle")
      .attr("dy", -5)
      .style("opacity", showConnectionLabels ? 0.7 : 0)
      .text(d => d.label || "");

    // Create nodes
    const nodeGroups = g.append("g")
      .selectAll("g")
      .data(nodes)
      .enter()
      .append("g")
      .style("cursor", "grab")
      .call(d3.drag<SVGGElement, DatabaseNode>()
        .on("start", (event, d: any) => {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
        })
        .on("drag", (event, d: any) => {
          d.fx = event.x;
          d.fy = event.y;
        })
        .on("end", (event, d: any) => {
          if (!event.active) simulation.alphaTarget(0);
          d.fx = null;
          d.fy = null;
        }));

    // Add glow filter
    const filter = defs.append("filter")
      .attr("id", "glow");
    
    filter.append("feGaussianBlur")
      .attr("stdDeviation", "3")
      .attr("result", "coloredBlur");
    
    const feMerge = filter.append("feMerge");
    feMerge.append("feMergeNode").attr("in", "coloredBlur");
    feMerge.append("feMergeNode").attr("in", "SourceGraphic");

    // Add node shapes based on type
    nodeGroups.each(function(d) {
      const group = d3.select(this);
      
      if (d.type === 'database') {
        // Databases as larger circles
        group.append("circle")
          .attr("r", d.size)
          .attr("fill", categoryColors[d.category as keyof typeof categoryColors] || "#6b7280")
          .attr("stroke", "#1e293b")
          .attr("stroke-width", 3)
          .style("filter", "url(#glow)")
          .style("opacity", 0.9);
      } else if (d.type === 'property') {
        // Properties as smaller rectangles
        group.append("rect")
          .attr("width", d.size * 2)
          .attr("height", d.size)
          .attr("x", -d.size)
          .attr("y", -d.size / 2)
          .attr("rx", 4)
          .attr("fill", categoryColors[d.category as keyof typeof categoryColors] || "#6b7280")
          .attr("stroke", "#1e293b")
          .attr("stroke-width", 1)
          .style("opacity", 0.8);
      }
    });

    // Add node labels
    nodeGroups.append("text")
      .attr("text-anchor", "middle")
      .attr("dy", d => d.type === 'database' ? 5 : 3)
      .attr("font-size", d => d.type === 'database' ? "12px" : "9px")
      .attr("font-weight", d => d.type === 'database' ? "bold" : "normal")
      .attr("fill", "white")
      .text(d => {
        // Truncate long property names
        if (d.type === 'property' && d.name.length > 12) {
          return d.name.substring(0, 12) + '...';
        }
        return d.name;
      });

    // Add hover effects
    nodeGroups
      .on("mouseenter", (event, d) => {
        setHoveredNode(d.id);
        const element = d3.select(event.currentTarget);
        
        if (d.type === 'database') {
          element.select("circle")
            .transition()
            .duration(200)
            .attr("r", d.size + 5)
            .style("opacity", 1);
        } else {
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
        
        if (d.type === 'database') {
          element.select("circle")
            .transition()
            .duration(200)
            .attr("r", d.size)
            .style("opacity", 0.9);
        } else {
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

    // Update positions on simulation tick
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
    <div className="relative w-full h-full">
      <svg ref={svgRef} className="w-full h-full" />
      
      {/* Node Info Panel */}
      {hoveredNode && (
        <div className="absolute top-4 left-4 bg-slate-800/90 backdrop-blur-sm rounded-lg p-4 border border-slate-600/50 max-w-sm">
          {(() => {
            const node = nodes.find(n => n.id === hoveredNode);
            if (!node) return null;
            
            return (
              <div>
                <h3 className="text-white font-bold text-lg mb-2">{node.name}</h3>
                <p className="text-slate-300 text-sm mb-2">{node.description}</p>
                <div className="flex gap-2 text-xs flex-wrap">
                  <span className="bg-blue-500/20 text-blue-300 px-2 py-1 rounded">
                    {node.type}
                  </span>
                  <span className="bg-purple-500/20 text-purple-300 px-2 py-1 rounded">
                    {node.category}
                  </span>
                  {node.propertyType && (
                    <span className="bg-green-500/20 text-green-300 px-2 py-1 rounded">
                      {node.propertyType}
                    </span>
                  )}
                </div>
              </div>
            );
          })()}
        </div>
      )}
      
      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-slate-800/90 backdrop-blur-sm rounded-lg p-3 border border-slate-600/50">
        <div className="text-slate-300 text-xs space-y-2">
          <div className="font-semibold mb-2">Node Types:</div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
            <span>Database</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-2 bg-green-500 rounded"></div>
            <span>Property</span>
          </div>
          <div className="mt-2 font-semibold">Connections:</div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-0.5 bg-blue-400"></div>
            <span>Contains</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-0.5 bg-red-400"></div>
            <span>Relation</span>
          </div>
        </div>
      </div>
      
      {/* Instructions */}
      <div className="absolute bottom-4 right-4 bg-slate-800/90 backdrop-blur-sm rounded-lg p-3 border border-slate-600/50">
        <div className="text-slate-300 text-xs space-y-1">
          <div>🖱️ Drag nodes to reposition</div>
          <div>🔍 Scroll to zoom in/out</div>
          <div>👆 Hover for node details</div>
        </div>
      </div>
    </div>
  );
};
