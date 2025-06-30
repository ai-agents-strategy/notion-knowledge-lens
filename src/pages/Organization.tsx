import { useAuth } from "@/hooks/useAuth";
import { SettingsHeader } from "@/components/SettingsHeader";
import { SettingsSidebar } from "@/components/SettingsSidebar";
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Organization = () => {
  const { user, isLoaded } = useAuth();

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <SettingsSidebar />
      <main className="flex-1">
        <SettingsHeader 
          title="Organization" 
          description="Manage your organization settings and team" 
        />

        <div className="mx-auto px-6 pb-8">
          {!isLoaded ? (
            <div className="flex justify-center items-center h-64">
            <Loader2 className="h-12 w-12 animate-spin text-notion-blue" />
          </div>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Organization Management</CardTitle>
              <CardDescription>
                Organization features are coming soon. For now, you can manage your personal account settings.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {user && (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                    <p className="text-gray-900 dark:text-white">{user.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">User ID</label>
                    <p className="text-gray-900 dark:text-white font-mono text-sm">{user.id}</p>
                  </div>
                </div>
              )}
            </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
};

export default Organization;
