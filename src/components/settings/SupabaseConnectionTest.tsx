import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Database, CheckCircle, XCircle, Loader2, Wifi } from "lucide-react";

export const SupabaseConnectionTest = () => {
  const { user } = useAuth();
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [testResults, setTestResults] = useState<any>(null);

  const testConnection = async () => {
    setIsTestingConnection(true);
    setConnectionStatus('idle');
    
    const results = {
      timestamp: new Date().toISOString(),
      tests: [] as any[]
    };

    try {
      // Test 1: Environment Variables
      console.log('🔍 Test 1: Checking environment variables...');
      const hasUrl = !!import.meta.env.VITE_SUPABASE_URL;
      const hasAnonKey = !!import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      results.tests.push({
        name: 'Environment Variables',
        status: hasUrl && hasAnonKey ? 'success' : 'error',
        details: {
          hasUrl,
          hasAnonKey,
          url: hasUrl ? `${import.meta.env.VITE_SUPABASE_URL.substring(0, 20)}...` : 'MISSING'
        }
      });

      // Test 2: Auth Session
      console.log('🔍 Test 2: Checking auth session...');
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      results.tests.push({
        name: 'Auth Session',
        status: sessionError ? 'error' : 'success',
        details: {
          hasSession: !!sessionData.session,
          userId: sessionData.session?.user?.id || 'none',
          error: sessionError?.message
        }
      });

      // Test 3: Database Query
      console.log('🔍 Test 3: Testing database query...');
      const queryStart = Date.now();
      
      try {
        const { data: queryData, error: queryError } = await supabase
          .from('integrations')
          .select('count')
          .limit(1);
          
        const queryTime = Date.now() - queryStart;
        
        results.tests.push({
          name: 'Database Query',
          status: queryError ? 'error' : 'success',
          details: {
            responseTime: `${queryTime}ms`,
            error: queryError?.message,
            canQuery: !queryError
          }
        });
      } catch (queryError) {
        results.tests.push({
          name: 'Database Query',
          status: 'error',
          details: {
            error: queryError instanceof Error ? queryError.message : 'Unknown error'
          }
        });
      }

      // Test 4: RLS Policies (if user is authenticated)
      if (user) {
        console.log('🔍 Test 4: Testing RLS policies...');
        try {
          const { data: rlsData, error: rlsError } = await supabase
            .from('integrations')
            .select('*')
            .eq('user_id', user.id)
            .limit(1);
            
          results.tests.push({
            name: 'RLS Policies',
            status: rlsError ? 'error' : 'success',
            details: {
              canAccessUserData: !rlsError,
              error: rlsError?.message,
              recordCount: rlsData?.length || 0
            }
          });
        } catch (rlsError) {
          results.tests.push({
            name: 'RLS Policies',
            status: 'error',
            details: {
              error: rlsError instanceof Error ? rlsError.message : 'Unknown error'
            }
          });
        }
      }

      // Determine overall status
      const hasErrors = results.tests.some(test => test.status === 'error');
      setConnectionStatus(hasErrors ? 'error' : 'success');
      
    } catch (error) {
      console.error('❌ Connection test failed:', error);
      setConnectionStatus('error');
      results.tests.push({
        name: 'Overall Test',
        status: 'error',
        details: {
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      });
    } finally {
      setTestResults(results);
      setIsTestingConnection(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Loader2 className="w-4 h-4 animate-spin" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge className="bg-green-100 text-green-800">Connected</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="w-5 h-5" />
          Supabase Connection Test
        </CardTitle>
        <CardDescription>
          Test your connection to the Supabase database and diagnose any issues.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wifi className="w-4 h-4" />
            <span className="font-medium">Connection Status:</span>
            {getStatusBadge(connectionStatus)}
          </div>
          
          <Button 
            onClick={testConnection} 
            disabled={isTestingConnection}
            variant="outline"
          >
            {isTestingConnection ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Testing...
              </>
            ) : (
              <>
                <Database className="w-4 h-4 mr-2" />
                Test Connection
              </>
            )}
          </Button>
        </div>

        {testResults && (
          <div className="space-y-3">
            <h4 className="font-medium">Test Results:</h4>
            {testResults.tests.map((test: any, index: number) => (
              <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                {getStatusIcon(test.status)}
                <div className="flex-1">
                  <div className="font-medium">{test.name}</div>
                  <div className="text-sm text-gray-600 mt-1">
                    {Object.entries(test.details).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').toLowerCase()}:</span>
                        <span className="font-mono text-xs">
                          {typeof value === 'boolean' ? (value ? '✓' : '✗') : String(value)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
            
            <div className="text-xs text-gray-500 mt-2">
              Test completed at: {new Date(testResults.timestamp).toLocaleString()}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};