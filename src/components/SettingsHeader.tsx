import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
interface SettingsHeaderProps {
  title: string;
  description: string;
}
export const SettingsHeader = ({
  title,
  description
}: SettingsHeaderProps) => {
  const location = useLocation();
  const navigationItems = [{
    path: '/settings',
    label: 'Integrations'
  }, {
    path: '/plan',
    label: 'Plan'
  }, {
    path: '/organization',
    label: 'Organization'
  }];
  return <div className="relative z-10 p-6">
      <div className="flex items-center gap-4 mb-8">
        <Link to="/">
          <Button variant="outline" size="sm" className="bg-white border-gray-300 text-black hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:hover:bg-gray-700">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Graph
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-4xl font-bold text-black dark:text-white mb-2">
            {title}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            {description}
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-2 mb-6">
        {navigationItems.map(item => <Link key={item.path} to={item.path}>
            
          </Link>)}
      </div>
    </div>;
};