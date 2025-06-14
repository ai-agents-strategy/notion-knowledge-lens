import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { DatabaseNode, DatabaseConnection } from "@/types/graph";

interface KnowledgeGraphProps {
  nodes: DatabaseNode[];
  connections: DatabaseConnection[];
  showConnectionLabels: boolean;
}

export const KnowledgeGraph = ({ nodes, connections, showConnectionLabels }: KnowledgeGraphProps) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  const categoryColors: Record<string, string> = {
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
    // SEO categories from sample data
    seo: "#3b82f6", // Blue
    content: "#10b981", // Green
    technical: "#8b5cf6", // Purple
    offpage: "#f59e0b", // Yellow
    local: "#ef4444", // Red
    ecommerce: "#ec4899", // Pink
    mobile: "#06b6d4", // Cyan
    analytics: "#f97316", // Orange
    research: "#6366f1", // Indigo
    // Legacy categories
    work: "#3b82f6",
    contacts: "#10b981", 
    knowledge: "#8b5cf6",
    planning: "#f59e0b",
    finance: "#ef4444",
    creativity: "#ec4899",
  };

  const connectionColors: Record<DatabaseConnection['type'], string> = {
    relation: "#dc2626",
    reference: "#34d399", 
    dependency: "#fbbf24",
    contains: "#60a5fa",
  };

  useEffect(() => {
    if (!svgRef.current || nodes.length === 0) {
        // Clear SVG if no nodes to display
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
        .attr("stop-color", connectionColors[conn.type] || "#cbd5e1")
        .attr("stop-opacity", 0.8);
      
      gradient.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", connectionColors[conn.type] || "#cbd5e1")
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
      .attr("fill", "#cbd5e1")
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
      .attr("fill", "white")
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

    // Add initial zoom transform to center the graph if desired
    // For example, to center and fit (this is a basic example, might need adjustment)
    // const bounds = g.node()?.getBBox();
    // if (bounds && bounds.width > 0 && bounds.height > 0) {
    //   const fullWidth = width;
    //   const fullHeight = height;
    //   const midX = bounds.x + bounds.width / 2;
    //   const midY = bounds.y + bounds.height / 2;
    //   const scale = Math.min(1, 0.9 / Math.max(bounds.width / fullWidth, bounds.height / fullHeight));
      
    //   svg.call(zoom.transform, d3.zoomIdentity
    //     .translate(fullWidth / 2 - scale * midX, fullHeight / 2 - scale * midY)
    //     .scale(scale));
    // }

    return () => {
      simulation.stop();
    };
  }, [nodes, connections, showConnectionLabels, categoryColors, connectionColors]);

  return (
    <div className="relative w-full h-full">
      <svg ref={svgRef} className="w-full h-full" />
      
      {hoveredNode && (
        <div className="absolute top-4 left-4 bg-slate-800/90 backdrop-blur-sm rounded-lg p-4 border border-slate-600/50 max-w-sm z-20">
          {(() => {
            const node = nodes.find(n => n.id === hoveredNode);
            if (!node) return null;
            
            return (
              <div>
                <h3 className="text-white font-bold text-lg mb-2">{node.name}</h3>
                <p className="text-slate-300 text-sm mb-2">{node.description}</p>
                <div className="flex gap-2 text-xs flex-wrap">
                  <span className={`px-2 py-1 rounded ${categoryColors[node.type] ? 'bg-opacity-20' : 'bg-gray-500/20 text-gray-300'}`} style={{backgroundColor: categoryColors[node.type] ? `${categoryColors[node.type]}33` : undefined, color: categoryColors[node.type] || undefined}}>
                    {node.type}
                  </span>
                  <span className={`px-2 py-1 rounded ${categoryColors[node.category.toLowerCase()] ? 'bg-opacity-20' : 'bg-gray-500/20 text-gray-300'}`} style={{backgroundColor: categoryColors[node.category.toLowerCase()] ? `${categoryColors[node.category.toLowerCase()]}33` : undefined, color: categoryColors[node.category.toLowerCase()] || undefined}}>
                    {node.category}
                  </span>
                  {node.propertyType && (
                     <span className={`px-2 py-1 rounded ${categoryColors[node.propertyType.toLowerCase()] ? 'bg-opacity-20' : 'bg-gray-500/20 text-gray-300'}`} style={{backgroundColor: categoryColors[node.propertyType.toLowerCase()] ? `${categoryColors[node.propertyType.toLowerCase()]}33` : undefined, color: categoryColors[node.propertyType.toLowerCase()] || undefined}}>
                      {node.propertyType}
                    </span>
                  )}
                </div>
              </div>
            );
          })()}
        </div>
      )}
      
      <div className="absolute bottom-4 left-4 bg-slate-800/90 backdrop-blur-sm rounded-lg p-3 border border-slate-600/50 z-20">
        <div className="text-slate-300 text-xs space-y-2">
          <div className="font-semibold mb-1 text-white">Node Types:</div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{backgroundColor: categoryColors.page || categoryColors.database}}></div>
            <span>Page/Database</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-1.5 rounded-sm" style={{backgroundColor: categoryColors.property || categoryColors.text}}></div>
            <span>Property</span>
          </div>
          <div className="mt-2 font-semibold text-white">Connections:</div>
          {Object.entries(connectionColors).map(([type, color]) => (
            <div key={type} className="flex items-center gap-2">
              <div className="w-3 h-0.5 rounded" style={{backgroundColor: color}}></div>
              <span className="capitalize">{type}</span>
            </div>
          ))}
        </div>
      </div>
      
      <div className="absolute bottom-4 right-4 bg-slate-800/90 backdrop-blur-sm rounded-lg p-3 border border-slate-600/50 text-slate-300 text-xs space-y-1 z-20">
        <div>🖱️ Drag nodes to reposition</div>
        <div>🔍 Scroll to zoom in/out</div>
        <div>👆 Hover for node details</div>
      </div>
    </div>
  );
};
