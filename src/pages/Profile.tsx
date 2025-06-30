import { UserProfile } from "@clerk/clerk-react";
import { SettingsHeader } from "@/components/SettingsHeader";
import { SettingsSidebar } from "@/components/SettingsSidebar";

const ProfilePage = () => {
  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <SettingsSidebar />
      <main className="flex-1">
        <SettingsHeader 
          title="Profile" 
          description="Manage your account settings, personal branding, and social links" 
        />
        <div className="mx-auto px-6 pb-8">
          <UserProfile />
        </div>
      </main>
    </div>
  );
};

export default ProfilePage;
