
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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-lg">Please sign in to access organization settings.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.1),transparent_50%)]" />
      
      <SettingsHeader title="Organization" description="Manage your organization settings and team" />

      {/* Main Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 pb-12">
        <div className="grid gap-6">
          {/* Organization Info */}
          <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50 text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                <Building2 className="w-5 h-5" />
                Organization Information
              </CardTitle>
              <CardDescription className="text-slate-300">
                Basic information about your organization
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="org-name" className="text-slate-200">Organization Name</Label>
                  <Input
                    id="org-name"
                    placeholder="Enter organization name"
                    value={organizationName}
                    onChange={(e) => setOrganizationName(e.target.value)}
                    className="bg-slate-700/30 border-slate-600 text-white placeholder:text-slate-400"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website" className="text-slate-200">Website</Label>
                  <Input
                    id="website"
                    placeholder="https://yourcompany.com"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    className="bg-slate-700/30 border-slate-600 text-white placeholder:text-slate-400"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="org-email" className="text-slate-200">Contact Email</Label>
                  <Input
                    id="org-email"
                    type="email"
                    placeholder="contact@yourcompany.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-slate-700/30 border-slate-600 text-white placeholder:text-slate-400"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-slate-200">Phone Number</Label>
                  <Input
                    id="phone"
                    placeholder="+1 (555) 123-4567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="bg-slate-700/30 border-slate-600 text-white placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address" className="text-slate-200">Address</Label>
                <Input
                  id="address"
                  placeholder="123 Business St, City, State 12345"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="bg-slate-700/30 border-slate-600 text-white placeholder:text-slate-400"
                />
              </div>

              <div className="pt-4">
                <Button 
                  onClick={handleSave}
                  disabled={isLoading}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isLoading ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Team Members */}
          <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50 text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl text-slate-200">
                <Users className="w-5 h-5" />
                Team Members
              </CardTitle>
              <CardDescription className="text-slate-300">
                Manage your organization's team members and their roles
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-4">
                {/* Current User */}
                <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                      {user.firstName?.[0] || user.emailAddresses[0]?.emailAddress[0]?.toUpperCase()}
                    </div>
                    <div>
                      <p className="text-white font-medium">
                        {user.firstName && user.lastName 
                          ? `${user.firstName} ${user.lastName}` 
                          : user.emailAddresses[0]?.emailAddress
                        }
                      </p>
                      <p className="text-slate-400 text-sm">
                        {user.emailAddresses[0]?.emailAddress}
                      </p>
                    </div>
                  </div>
                  <Badge className="bg-purple-600 text-white">Owner</Badge>
                </div>

                {/* Placeholder for additional team members */}
                <div className="text-center py-8 text-slate-400">
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
  );
};

export default Organization;
