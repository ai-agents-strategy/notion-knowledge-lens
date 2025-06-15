
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { DatabaseNode, DatabaseConnection } from "@/types/graph";
import { getCategoryColor } from "@/components/KnowledgeGraph/graphConfig";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Link as LinkIcon } from "lucide-react";
import { Input } from "@/components/ui/input";

interface DetailedNodeViewProps {
  nodeId: string | null;
  nodes: DatabaseNode[];
  connections: DatabaseConnection[];
  onClose: () => void;
  categoryColors: Record<string, string>;
  onCategoryColorsChange: (colors: Record<string, string>) => void;
}

const findNodeName = (id: string, nodes: DatabaseNode[]) => nodes.find(n => n.id === id)?.name || "Unknown Node";

// Helper function to get the ID from connection source/target (handles both string IDs and D3 objects)
const getConnectionId = (sourceOrTarget: any): string => {
  if (typeof sourceOrTarget === 'string') {
    return sourceOrTarget;
  }
  if (sourceOrTarget && typeof sourceOrTarget === 'object' && sourceOrTarget.id) {
    return sourceOrTarget.id;
  }
  return '';
};

export const DetailedNodeView = ({ nodeId, nodes, connections, onClose, categoryColors, onCategoryColorsChange }: DetailedNodeViewProps) => {
  const selectedNode = nodeId ? nodes.find(n => n.id === nodeId) : null;

  if (!selectedNode) {
    return null;
  }

  // Filter connections using the helper function to handle D3 objects
  const outgoingConnections = connections.filter(c => getConnectionId(c.source) === nodeId);
  const incomingConnections = connections.filter(c => getConnectionId(c.target) === nodeId);

  // Use improved color logic that falls back gracefully for real Notion data
  const nodeColor = categoryColors[selectedNode.category.toLowerCase()] || getCategoryColor(selectedNode.category);

  const handleCategoryColorChange = (category: string, color: string) => {
    onCategoryColorsChange({ ...categoryColors, [category.toLowerCase()]: color });
  };

  return (
    <Sheet open={!!nodeId} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-[400px] sm:w-[540px] p-0 overflow-y-auto">
        <SheetHeader className="p-6 border-b sticky top-0 bg-background z-10">
          <SheetTitle className="text-xl flex items-center gap-3">
             <span className="block w-4 h-4 rounded-full flex-shrink-0" style={{ backgroundColor: nodeColor }}></span>
            <span className="truncate">{selectedNode.name}</span>
          </SheetTitle>
          <SheetDescription>
            {selectedNode.description || "No description available."}
          </SheetDescription>
        </SheetHeader>
        <div className="p-6 space-y-6">
          <div>
            <h3 className="font-semibold text-lg mb-4">Details</h3>
            <div className="grid grid-cols-[120px_1fr] gap-x-4 gap-y-2 text-sm">
              <div className="text-muted-foreground">Category</div>
              <div className="flex justify-start items-center gap-2">
                <Badge style={{ backgroundColor: nodeColor, color: 'white' }}>{selectedNode.category}</Badge>
                <Input
                  type="color"
                  value={categoryColors[selectedNode.category.toLowerCase()] || nodeColor}
                  onChange={(e) => handleCategoryColorChange(selectedNode.category, e.target.value)}
                  className="p-1 h-6 w-8 rounded cursor-pointer"
                />
              </div>
              <div className="text-muted-foreground">Type</div>
              <div>{selectedNode.type}</div>
              {selectedNode.propertyType && (
                <>
                  <div className="text-muted-foreground">Property Type</div>
                  <div>{selectedNode.propertyType}</div>
                </>
              )}
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold text-lg mb-4">Connections</h3>
            {outgoingConnections.length === 0 && incomingConnections.length === 0 ? (
              <p className="text-sm text-muted-foreground">No connections found for this node.</p>
            ) : (
              <div className="space-y-4">
                {outgoingConnections.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2 text-muted-foreground">Outgoing</h4>
                    <ul className="space-y-2">
                      {outgoingConnections.map((conn, i) => (
                        <li key={`out-${i}`} className="text-sm flex items-center gap-2">
                          <span className="text-muted-foreground">{conn.label || conn.type}</span>
                          <ArrowRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                          <span className="truncate">{findNodeName(getConnectionId(conn.target), nodes)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {incomingConnections.length > 0 && (
                  <div>
                    <h4 className="font-medium mt-4 mb-2 text-muted-foreground">Incoming</h4>
                    <ul className="space-y-2">
                      {incomingConnections.map((conn, i) => (
                        <li key={`in-${i}`} className="text-sm flex items-center gap-2">
                         <span className="truncate">{findNodeName(getConnectionId(conn.source), nodes)}</span>
                         <ArrowRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                         <span className="text-muted-foreground">{conn.label || conn.type}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>

          {selectedNode.type === 'page' && (
             <a
                href={`https://www.notion.so/${selectedNode.id.replace(/-/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-blue-600 hover:underline pt-4"
              >
                <LinkIcon className="w-4 h-4" />
                Open in Notion
              </a>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};
