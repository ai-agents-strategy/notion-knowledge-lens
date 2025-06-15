
import { OrganizationProfile } from "@clerk/clerk-react";
import { SettingsSidebar } from "@/components/SettingsSidebar";

const Organization = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      {/* Global Sidebar */}
      <SettingsSidebar />

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <OrganizationProfile routing="path" path="/organization" />
      </main>
    </div>
  );
};

export default Organization;
