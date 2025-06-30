import { OrganizationProfile } from "@clerk/clerk-react";
import { SettingsHeader } from "@/components/SettingsHeader";
import { SettingsSidebar } from "@/components/SettingsSidebar";

const OrganizationPage = () => {
  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <SettingsSidebar />
      <main className="flex-1">
        <SettingsHeader 
          title="Organization" 
          description="Manage your organization settings and team" 
        />
        <div className="mx-auto px-6 pb-8">
          <OrganizationProfile />
        </div>
      </main>
    </div>
  );
};

export default OrganizationPage;
