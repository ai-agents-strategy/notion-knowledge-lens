import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

interface SettingsHeaderProps {
  title: string;
  description: string;
}

export const SettingsHeader = ({ title, description }: SettingsHeaderProps) => {
  return (
    <div className="relative z-10 p-6">
      <div className="flex-1">
        <h1 className="text-4xl font-bold text-black dark:text-white mb-2">
          {title}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 text-lg">
          {description}
        </p>
      </div>
    </div>
  );
};
