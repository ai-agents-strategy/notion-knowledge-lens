
import { Button } from "@/components/ui/button";
import { ArrowLeft, Crown, Key, Building2 } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { OrganizationSwitcher } from "./OrganizationSwitcher";

export const SettingsNavigation = () => {
  const location = useLocation();

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 space-y-6">
        {/* Back to Graph Button */}
        <Link to="/">
          <Button variant="outline" size="sm" className="w-full justify-start bg-white border-gray-300 text-black hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:hover:bg-gray-700">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Graph
          </Button>
        </Link>
        
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-700">Settings Navigation</h2>
          <div className="space-y-2">
            <Link to="/settings" className="block">
              <Button 
                variant={location.pathname === '/settings' ? "default" : "outline"} 
                size="sm" 
                className="w-full justify-start"
              >
                <Key className="w-4 h-4 mr-2" />
                Integrations
              </Button>
            </Link>
            <Link to="/plan" className="block">
              <Button 
                variant={location.pathname === '/plan' ? "default" : "outline"} 
                size="sm" 
                className="w-full justify-start"
              >
                <Crown className="w-4 h-4 mr-2" />
                Plan
              </Button>
            </Link>
            <Link to="/organization" className="block">
              <Button 
                variant={location.pathname === '/organization' ? "default" : "outline"} 
                size="sm" 
                className="w-full justify-start"
              >
                <Building2 className="w-4 h-4 mr-2" />
                Organization
              </Button>
            </Link>
          </div>
        </div>
      </div>
      
      {/* Organization Switcher moved to bottom */}
      <div className="mt-auto">
        <OrganizationSwitcher />
      </div>
    </div>
  );
};
