import { useAuth } from "@/hooks/useAuth";
import { SettingsSidebar } from "@/components/SettingsSidebar";
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Organization = () => {
  const { user, isLoaded } = useAuth();

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
        ) : (
          <div className="max-w-4xl">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Organization</h2>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Manage your organization settings and team
              </p>
            </div>

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
          </div>
        )}
      </main>
    </div>
  );
};

export default Organization;