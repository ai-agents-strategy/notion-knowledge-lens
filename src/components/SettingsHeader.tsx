
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

interface SettingsHeaderProps {
  title: string;
  description: string;
}

export const SettingsHeader = ({ title, description }: SettingsHeaderProps) => {
  const location = useLocation();

  const navigationItems = [
    { path: '/settings', label: 'Integrations' },
    { path: '/plan', label: 'Plan' },
    { path: '/organization', label: 'Organization' },
  ];

  return (
    <div className="relative z-10 p-6">
      <div className="flex items-center gap-4 mb-8">
        <Link to="/">
          <Button variant="outline" size="sm" className="bg-slate-800/50 border-slate-700/50 text-white hover:bg-slate-700/50">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Graph
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-4xl font-bold text-white mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            {title}
          </h1>
          <p className="text-slate-300 text-lg">
            {description}
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-2 mb-6">
        {navigationItems.map((item) => (
          <Link key={item.path} to={item.path}>
            <Button
              variant={location.pathname === item.path ? "default" : "outline"}
              size="sm"
              className={
                location.pathname === item.path
                  ? "bg-blue-600 hover:bg-blue-700 text-white"
                  : "bg-slate-800/50 border-slate-700/50 text-slate-200 hover:bg-slate-700/50"
              }
            >
              {item.label}
            </Button>
          </Link>
        ))}
      </div>
    </div>
  );
};
