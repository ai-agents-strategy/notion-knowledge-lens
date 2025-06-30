import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useIntegrations } from "@/hooks/useIntegrations";
import { SettingsHeader } from "@/components/SettingsHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "@/hooks/use-toast";
import { 
  User, 
  Mail, 
  Calendar, 
  Database, 
  Share2, 
  Activity, 
  Settings,
  Trash2,
  Download,
  Save,
  ExternalLink,
  Globe,
  Loader2
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

interface UserStats {
  totalGraphs: number;
  publicGraphs: number;
  lastSync: string | null;
  totalNodes: number;
  totalConnections: number;
}

interface UserProfile {
  user_name: string;
  user_bio: string;
  user_website: string;
  user_twitter: string;
  user_linkedin: string;
  user_github: string;
}

const Profile = () => {
  const { user, signOut } = useAuth();
  const { integrations } = useIntegrations();
  const [userStats, setUserStats] = useState<UserStats>({
    totalGraphs: 0,
    publicGraphs: 0,
    lastSync: null,
    totalNodes: 0,
    totalConnections: 0
  });
  const [userProfile, setUserProfile] = useState<UserProfile>({
    user_name: '',
    user_bio: '',
    user_website: '',
    user_twitter: '',
    user_linkedin: '',
    user_github: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user]);

  const loadUserData = async () => {
    if (!user) return;

    try {
      setIsLoading(true);

      // Load profile data
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('clerk_user_id', user.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        console.error('Error loading profile:', profileError);
      } else if (profile) {
        setUserProfile({
          user_name: profile.user_name || '',
          user_bio: profile.user_bio || '',
          user_website: profile.user_website || '',
          user_twitter: profile.user_twitter || '',
          user_linkedin: profile.user_linkedin || '',
          user_github: profile.user_github || ''
        });
      }

      // Get graph statistics
      const { data: graphs, error: graphError } = await supabase
        .from('graphs')
        .select('public_id, nodes, connections, updated_at')
        .eq('user_id', user.id);

      if (graphError) {
        console.error('Error loading graph stats:', graphError);
      }

      // Calculate stats
      const totalGraphs = graphs?.length || 0;
      const publicGraphs = graphs?.filter(g => g.public_id).length || 0;
      const lastSync = localStorage.getItem('notion_last_sync');
      
      // Calculate total nodes and connections from stored data
      const storedNodes = localStorage.getItem('notion_graph_nodes');
      const storedConnections = localStorage.getItem('notion_graph_connections');
      
      let totalNodes = 0;
      let totalConnections = 0;
      
      if (storedNodes) {
        try {
          const nodes = JSON.parse(storedNodes);
          totalNodes = nodes.length;
        } catch (e) {
          console.error('Error parsing stored nodes:', e);
        }
      }
      
      if (storedConnections) {
        try {
          const connections = JSON.parse(storedConnections);
          totalConnections = connections.length;
        } catch (e) {
          console.error('Error parsing stored connections:', e);
        }
      }

      setUserStats({
        totalGraphs,
        publicGraphs,
        lastSync,
        totalNodes,
        totalConnections
      });
    } catch (error) {
      console.error('Error loading user data:', error);
      toast({
        title: "Error",
        description: "Failed to load profile data.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const saveProfile = async () => {
    if (!user) return;

    setIsSavingProfile(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          clerk_user_id: user.id,
          ...userProfile
        });

      if (error) throw error;

      toast({
        title: "Profile updated",
        description: "Your profile has been saved successfully.",
      });
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        title: "Error",
        description: "Failed to save profile. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSavingProfile(false);
    }
  };

  const exportData = async () => {
    try {
      const data = {
        user: {
          id: user?.id,
          email: user?.email,
          created_at: user?.created_at
        },
        profile: userProfile,
        integrations: integrations,
        graphs: userStats,
        exportedAt: new Date().toISOString()
      };

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `profile-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Data exported",
        description: "Your profile data has been downloaded.",
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "Failed to export your data. Please try again.",
        variant: "destructive"
      });
    }
  };

  const deleteAccount = async () => {
    if (!user) return;

    setIsDeleting(true);
    try {
      console.log('🗑️ Starting account deletion process...');
      
      // Delete user data from our tables
      await supabase.from('graphs').delete().eq('user_id', user.id);
      await supabase.from('integrations').delete().eq('user_id', user.id);
      await supabase.from('profiles').delete().eq('clerk_user_id', user.id);

      // Clear local storage
      localStorage.clear();

      toast({
        title: "Account data deleted",
        description: "Your account data has been deleted. Signing you out...",
      });

      // Sign out the user
      await signOut();
      
    } catch (error) {
      console.error('Error deleting account:', error);
      toast({
        title: "Deletion failed",
        description: "Failed to delete your account data. Please try again or contact support.",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getUserInitials = () => {
    if (userProfile.user_name) {
      return userProfile.user_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    if (user?.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return 'U';
  };

  const getAccountAge = () => {
    if (!user?.created_at) return 'Unknown';
    const created = new Date(user.created_at);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - created.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 30) {
      return `${diffDays} days`;
    } else if (diffDays < 365) {
      return `${Math.floor(diffDays / 30)} months`;
    } else {
      return `${Math.floor(diffDays / 365)} years`;
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <p>Please sign in to view your profile.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <SettingsHeader 
        title="Profile" 
        description="Manage your account settings, personal branding, and social links" 
      />

      <div className="max-w-4xl mx-auto px-6 pb-8">
        <div className="grid gap-6">
          {/* Profile Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="text-lg font-semibold">
                    {getUserInitials()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-2xl font-bold">Profile Overview</h2>
                  <p className="text-muted-foreground">Your account information and settings</p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <Label className="text-sm font-medium">Email Address</Label>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <User className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <Label className="text-sm font-medium">User ID</Label>
                      <p className="text-sm text-muted-foreground font-mono">{user.id.slice(0, 8)}...</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <Label className="text-sm font-medium">Member Since</Label>
                      <p className="text-sm text-muted-foreground">{formatDate(user.created_at)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Activity className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <Label className="text-sm font-medium">Account Age</Label>
                      <p className="text-sm text-muted-foreground">{getAccountAge()}</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Personal Branding */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                Personal Branding & Social Links
              </CardTitle>
              <CardDescription>
                Customize your public profile for gallery showcase and personal branding
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="user_name">Display Name</Label>
                  <Input
                    id="user_name"
                    placeholder="Your full name"
                    value={userProfile.user_name}
                    onChange={(e) => setUserProfile(prev => ({ ...prev, user_name: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="user_website">Website</Label>
                  <Input
                    id="user_website"
                    placeholder="https://yourwebsite.com"
                    value={userProfile.user_website}
                    onChange={(e) => setUserProfile(prev => ({ ...prev, user_website: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="user_bio">Bio</Label>
                <Textarea
                  id="user_bio"
                  placeholder="Tell people about yourself and your work..."
                  value={userProfile.user_bio}
                  onChange={(e) => setUserProfile(prev => ({ ...prev, user_bio: e.target.value }))}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="user_twitter">Twitter Username</Label>
                  <Input
                    id="user_twitter"
                    placeholder="username"
                    value={userProfile.user_twitter}
                    onChange={(e) => setUserProfile(prev => ({ ...prev, user_twitter: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="user_linkedin">LinkedIn Username</Label>
                  <Input
                    id="user_linkedin"
                    placeholder="username"
                    value={userProfile.user_linkedin}
                    onChange={(e) => setUserProfile(prev => ({ ...prev, user_linkedin: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="user_github">GitHub Username</Label>
                  <Input
                    id="user_github"
                    placeholder="username"
                    value={userProfile.user_github}
                    onChange={(e) => setUserProfile(prev => ({ ...prev, user_github: e.target.value }))}
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button onClick={saveProfile} disabled={isSavingProfile}>
                  <Save className="w-4 h-4 mr-2" />
                  {isSavingProfile ? 'Saving...' : 'Save Profile'}
                </Button>
              </div>

              <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <Globe className="w-4 h-4 inline mr-1" />
                  This information will be displayed when your graphs are featured in the public gallery.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Activity Statistics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Activity & Statistics
              </CardTitle>
              <CardDescription>
                Your usage statistics and activity overview
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                  <Database className="w-6 h-6 mx-auto mb-2 text-blue-600" />
                  <div className="text-2xl font-bold text-blue-600">{userStats.totalGraphs}</div>
                  <div className="text-xs text-muted-foreground">Total Graphs</div>
                </div>
                
                <div className="text-center p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                  <Share2 className="w-6 h-6 mx-auto mb-2 text-green-600" />
                  <div className="text-2xl font-bold text-green-600">{userStats.publicGraphs}</div>
                  <div className="text-xs text-muted-foreground">Public Graphs</div>
                </div>
                
                <div className="text-center p-4 bg-purple-50 dark:bg-purple-950 rounded-lg">
                  <div className="w-6 h-6 mx-auto mb-2 bg-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">N</span>
                  </div>
                  <div className="text-2xl font-bold text-purple-600">{userStats.totalNodes}</div>
                  <div className="text-xs text-muted-foreground">Total Nodes</div>
                </div>
                
                <div className="text-center p-4 bg-orange-50 dark:bg-orange-950 rounded-lg">
                  <div className="w-6 h-6 mx-auto mb-2 bg-orange-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">C</span>
                  </div>
                  <div className="text-2xl font-bold text-orange-600">{userStats.totalConnections}</div>
                  <div className="text-xs text-muted-foreground">Connections</div>
                </div>
                
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <Calendar className="w-6 h-6 mx-auto mb-2 text-gray-600" />
                  <div className="text-sm font-bold text-gray-600">
                    {userStats.lastSync ? 'Synced' : 'Never'}
                  </div>
                  <div className="text-xs text-muted-foreground">Last Sync</div>
                </div>
              </div>
              
              {userStats.lastSync && (
                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    Last synced with Notion: {formatDate(userStats.lastSync)}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Connected Integrations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Connected Integrations
              </CardTitle>
              <CardDescription>
                Services connected to your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              {integrations.length > 0 ? (
                <div className="space-y-3">
                  {integrations.map((integration) => (
                    <div key={integration.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                          <span className="text-blue-600 font-semibold text-sm">
                            {integration.integration_type.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium capitalize">{integration.integration_type}</p>
                          <p className="text-sm text-muted-foreground">
                            Connected {formatDate(integration.created_at)}
                          </p>
                        </div>
                      </div>
                      <Badge variant="secondary">Connected</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Settings className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No integrations connected yet</p>
                  <Button variant="outline" className="mt-2" onClick={() => window.location.href = '/settings'}>
                    Connect Integrations
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Data Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="w-5 h-5" />
                Data Management
              </CardTitle>
              <CardDescription>
                Export or delete your account data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">Export Data</h4>
                  <p className="text-sm text-muted-foreground">
                    Download all your profile data, integrations, and settings
                  </p>
                </div>
                <Button variant="outline" onClick={exportData}>
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>

              <Separator />

              <div className="flex items-center justify-between p-4 border border-red-200 dark:border-red-800 rounded-lg bg-red-50 dark:bg-red-950">
                <div>
                  <h4 className="font-medium text-red-800 dark:text-red-200">Delete Account Data</h4>
                  <p className="text-sm text-red-600 dark:text-red-400">
                    Permanently delete your account data and sign out
                  </p>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" disabled={isDeleting}>
                      {isDeleting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Deleting...
                        </>
                      ) : (
                        <>
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete Data
                        </>
                      )}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete your account
                        data from our servers, including:
                        <ul className="list-disc list-inside mt-2 space-y-1">
                          <li>All your knowledge graphs</li>
                          <li>Integration settings and API keys</li>
                          <li>Profile information</li>
                          <li>Public shared graphs</li>
                        </ul>
                        <br />
                        <strong>Note:</strong> This will delete your data and sign you out, but your Supabase auth account will remain. You can sign back in anytime to create new data.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={deleteAccount} className="bg-red-600 hover:bg-red-700">
                        Yes, delete my data
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;