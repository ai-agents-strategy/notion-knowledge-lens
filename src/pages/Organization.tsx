
import { OrganizationProfile } from "@clerk/clerk-react";
import { SettingsHeader } from "@/components/SettingsHeader";
import { SettingsNavigation } from "@/components/SettingsNavigation";
import { SidebarProvider, Sidebar, SidebarContent, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";

const Organization = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen bg-white dark:bg-gray-900 flex w-full">
        {/* Background Pattern - Notion inspired */}
        <div className="absolute inset-0 bg-gradient-to-br from-white to-blue-50 dark:from-gray-900 dark:to-gray-800" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(35,131,226,0.05),transparent_50%)]" />
        
        {/* Sidebar */}
        <Sidebar side="left" className="border-r">
          <SidebarContent className="p-6 bg-slate-50">
            <SettingsNavigation />
          </SidebarContent>
        </Sidebar>

        {/* Main Content */}
        <SidebarInset className="flex-1">
          <SidebarTrigger />
          
          <div className="relative z-10 p-6 bg-zinc-50 min-h-full">
            <SettingsHeader title="Organization" description="Manage your organization settings and team" />

            {/* Main Content */}
            <div className="max-w-4xl mx-auto">
              <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
                <OrganizationProfile 
                  appearance={{
                    elements: {
                      card: "shadow-none border-none bg-transparent",
                      navbar: "hidden",
                      navbarMobileMenuButton: "hidden",
                      headerTitle: "text-2xl font-bold text-gray-900 dark:text-white",
                      headerSubtitle: "text-gray-600 dark:text-gray-400"
                    }
                  }}
                />
              </div>
            </div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Organization;
