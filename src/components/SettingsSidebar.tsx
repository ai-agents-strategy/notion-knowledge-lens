import React from 'react';
import { NavLink } from 'react-router-dom';
import { User, Building, Settings, ArrowLeft } from 'lucide-react';

const navLinks = [
  { to: '/profile', icon: <User className="w-5 h-5" />, text: 'Profile' },
  { to: '/organization', icon: <Building className="w-5 h-5" />, text: 'Organization' },
  { to: '/settings', icon: <Settings className="w-5 h-5" />, text: 'Integrations' },
];

const backLink = { to: '/', icon: <ArrowLeft className="w-5 h-5" />, text: 'Back to Graph' };

export const SettingsSidebar: React.FC = () => {
  return (
    <aside className="w-64 flex-shrink-0 p-6 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col justify-between">
      <nav className="space-y-2">
        {navLinks.map(({ to, icon, text }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-white'
                  : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
              }`
            }
          >
            {icon}
            <span>{text}</span>
          </NavLink>
        ))}
      </nav>
      <nav>
        <NavLink
          to={backLink.to}
          className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          {backLink.icon}
          <span>{backLink.text}</span>
        </NavLink>
      </nav>
    </aside>
  );
};
