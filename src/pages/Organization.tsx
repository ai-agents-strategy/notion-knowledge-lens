import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Building2, Users, Mail, Phone, MapPin, Save } from "lucide-react";
import { useUser } from "@clerk/clerk-react";
import { toast } from "@/hooks/use-toast";
import { SettingsHeader } from "@/components/SettingsHeader";
import { SettingsNavigation } from "@/components/SettingsNavigation";
import { SidebarProvider, Sidebar, SidebarContent, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { Link } from "react-router-dom";

const Organization = () => {
  const { user } = useUser();
  const [organizationName, setOrganizationName] = useState('');
  const [website, setWebsite] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    setIsLoading(true);
    
    try {
      // Simulate saving organization data
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Organization settings saved!",
        description: "Your organization information has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save organization settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="text-black dark:text-white text-lg">Please sign in to access organization settings.</div>
      </div>
    );
  }

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
              <div className="grid gap-6">
                {/* Organization Info */}
                <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-gray-200 dark:border-gray-700 text-black dark:text-white shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xl text-notion-blue dark:text-blue-400">
                      <Building2 className="w-5 h-5" />
                      Organization Information
                    </CardTitle>
                    <CardDescription className="text-gray-600 dark:text-gray-400">
                      Basic information about your organization
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="org-name" className="text-black dark:text-white">Organization Name</Label>
                        <Input
                          id="org-name"
                          placeholder="Enter organization name"
                          value={organizationName}
                          onChange={(e) => setOrganizationName(e.target.value)}
                          className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-black dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="website" className="text-black dark:text-white">Website</Label>
                        <Input
                          id="website"
                          placeholder="https://yourcompany.com"
                          value={website}
                          onChange={(e) => setWebsite(e.target.value)}
                          className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-black dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="org-email" className="text-black dark:text-white">Contact Email</Label>
                        <Input
                          id="org-email"
                          type="email"
                          placeholder="contact@yourcompany.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-black dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone" className="text-black dark:text-white">Phone Number</Label>
                        <Input
                          id="phone"
                          placeholder="+1 (555) 123-4567"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-black dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="address" className="text-black dark:text-white">Address</Label>
                      <Input
                        id="address"
                        placeholder="123 Business St, City, State 12345"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-black dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
                      />
                    </div>

                    <div className="pt-4">
                      <Button 
                        onClick={handleSave}
                        disabled={isLoading}
                        className="bg-notion-blue hover:bg-blue-700 text-white"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        {isLoading ? "Saving..." : "Save Changes"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Team Members */}
                <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-gray-200 dark:border-gray-700 text-black dark:text-white shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xl text-black dark:text-white">
                      <Users className="w-5 h-5" />
                      Team Members
                    </CardTitle>
                    <CardDescription className="text-gray-600 dark:text-gray-400">
                      Manage your organization's team members and their roles
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-4">
                      {/* Current User */}
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-notion-blue rounded-full flex items-center justify-center text-white font-semibold">
                            {user.firstName?.[0] || user.emailAddresses[0]?.emailAddress[0]?.toUpperCase()}
                          </div>
                          <div>
                            <p className="text-black dark:text-white font-medium">
                              {user.firstName && user.lastName 
                                ? `${user.firstName} ${user.lastName}` 
                                : user.emailAddresses[0]?.emailAddress
                              }
                            </p>
                            <p className="text-gray-600 dark:text-gray-400 text-sm">
                              {user.emailAddresses[0]?.emailAddress}
                            </p>
                          </div>
                        </div>
                        <Badge className="bg-purple-600 text-white">Owner</Badge>
                      </div>

                      {/* Placeholder for additional team members */}
                      <div className="text-center py-8 text-gray-600 dark:text-gray-400">
                        <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No additional team members yet</p>
                        <p className="text-sm">Team management features coming soon</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Organization;
