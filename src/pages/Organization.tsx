
import {
  OrganizationProfile,
  useOrganization,
  OrganizationList,
} from "@clerk/clerk-react";
import { SettingsSidebar } from "@/components/SettingsSidebar";
import { Loader2 } from "lucide-react";

const Organization = () => {
  const { organization, isLoaded } = useOrganization();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      {/* Global Sidebar */}
      <SettingsSidebar />

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        {!isLoaded ? (
          <div className="flex justify-center items-center h-full">
            <Loader2 className="h-12 w-12 animate-spin text-notion-blue" />
          </div>
        ) : organization ? (
          <OrganizationProfile routing="path" path="/organization" />
        ) : (
          <div className="flex flex-col items-center">
            <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
              Manage Organization
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              Select an organization to manage or create a new one.
            </p>
            <OrganizationList
              hidePersonal
              afterSelectOrganizationUrl="/organization"
              afterCreateOrganizationUrl="/organization"
            />
          </div>
        )}
      </main>
    </div>
  );
};

export default Organization;
