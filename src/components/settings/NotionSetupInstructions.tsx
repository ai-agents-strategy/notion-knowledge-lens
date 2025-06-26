import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Database } from "lucide-react";

export const NotionSetupInstructions = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="w-5 h-5" />
          How to Set Up Notion Integration
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-3 text-sm">
          <div className="flex gap-3">
            <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">1</span>
            <div>
              <p className="font-medium">Create a Notion Integration</p>
              <p className="text-gray-600">Go to notion.so/my-integrations and create a new integration</p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">2</span>
            <div>
              <p className="font-medium">Copy the Integration Token</p>
              <p className="text-gray-600">Copy the "Internal Integration Token" and paste it above</p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">3</span>
            <div>
              <p className="font-medium">Share Databases with Integration</p>
              <p className="text-gray-600">In Notion, share your databases with the integration you created</p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">4</span>
            <div>
              <p className="font-medium">Save Settings and Sync</p>
              <p className="text-gray-600">Save your API key and click "Sync Databases" to fetch your real data</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
