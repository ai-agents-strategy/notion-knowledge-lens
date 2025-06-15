
import { Button } from "@/components/ui/button";
import { ArrowLeft, Key, CreditCard, Building2 } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

export const SettingsSidebar = () => {
  const location = useLocation();

  const navigationItems = [
    { path: '/settings', label: 'Integrations', icon: Key },
    { path: '/plan', label: 'Plan', icon: CreditCard },
    { path: '/organization', label: 'Organization', icon: Building2 },
  ];

  return (
    <div className="w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 h-screen p-6">
      {/* Back to Graph Button */}
      <div className="mb-8">
        <Link to="/">
          <Button variant="outline" size="sm" className="w-full justify-start">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Graph
          </Button>
        </Link>
      </div>

      {/* Settings Title */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
          Manage your account and preferences
        </p>
      </div>

      {/* Navigation Menu */}
      <nav className="space-y-2">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link key={item.path} to={item.path}>
              <Button
                variant={isActive ? "default" : "ghost"}
                size="sm"
                className={`w-full justify-start ${
                  isActive 
                    ? "bg-blue-600 hover:bg-blue-700 text-white" 
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                <Icon className="w-4 h-4 mr-3" />
                {item.label}
              </Button>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};
