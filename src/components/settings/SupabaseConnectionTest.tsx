import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Database, CheckCircle, XCircle, Loader2, Wifi, AlertTriangle } from "lucide-react";

export const SupabaseConnectionTest = () => {
  const { user } = useAuth();
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [testResults, setTestResults] = useState<any>(null);

  const testWithTimeout = async <T,>(
    promise: Promise<T>, 
    timeoutMs: number, 
    timeoutMessage: string
  ): Promise<T> => {
    const timeoutPromise = new Promise<never>((_, reject) => 
      setTimeout(() => reject(new Error(timeoutMessage)), timeoutMs)
    );
    
    return Promise.race([promise, timeoutPromise]);
  };

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
          url: hasUrl ? `${import.meta.env.VITE_SUPABASE_URL.substring(0, 30)}...` : 'MISSING'
        }
      });

      if (!hasUrl || !hasAnonKey) {
        setConnectionStatus('error');
        setTestResults(results);
        setIsTestingConnection(false);
        return;
      }

      // Test 2: Auth Session with timeout
      console.log('🔍 Test 2: Checking auth session...');
      try {
        const sessionResult = await testWithTimeout(
          supabase.auth.getSession(),
          5000,
          'Auth session check timeout after 5 seconds'
        );
        
        results.tests.push({
          name: 'Auth Session',
          status: sessionResult.error ? 'error' : 'success',
          details: {
            hasSession: !!sessionResult.data.session,
            userId: sessionResult.data.session?.user?.id || 'none',
            error: sessionResult.error?.message
          }
        });
      } catch (sessionError) {
        console.error('❌ Auth session test failed:', sessionError);
        results.tests.push({
          name: 'Auth Session',
          status: 'error',
          details: {
            hasSession: false,
            userId: 'none',
            error: sessionError instanceof Error ? sessionError.message : 'Unknown auth error'
          }
        });
      }

      // Test 3: Database Query with timeout
      console.log('🔍 Test 3: Testing database query...');
      const queryStart = Date.now();
      
      try {
        const queryResult = await testWithTimeout(
          supabase.from('integrations').select('count').limit(1),
          8000,
          'Database query timeout after 8 seconds'
        );
        
        const queryTime = Date.now() - queryStart;
        
        results.tests.push({
          name: 'Database Query',
          status: queryResult.error ? 'error' : 'success',
          details: {
            responseTime: `${queryTime}ms`,
            error: queryResult.error?.message,
            canQuery: !queryResult.error
          }
        });
      } catch (queryError) {
        const queryTime = Date.now() - queryStart;
        console.error('❌ Database query test failed:', queryError);
        results.tests.push({
          name: 'Database Query',
          status: 'error',
          details: {
            responseTime: `${queryTime}ms (failed)`,
            error: queryError instanceof Error ? queryError.message : 'Unknown query error'
          }
        });
      }

      // Test 4: RLS Policies (if user is authenticated)
      if (user) {
        console.log('🔍 Test 4: Testing RLS policies...');
        try {
          const rlsResult = await testWithTimeout(
            supabase
              .from('integrations')
              .select('*')
              .eq('user_id', user.id)
              .limit(1),
            5000,
            'RLS policy test timeout after 5 seconds'
          );
            
          results.tests.push({
            name: 'RLS Policies',
            status: rlsResult.error ? 'error' : 'success',
            details: {
              canAccessUserData: !rlsResult.error,
              error: rlsResult.error?.message,
              recordCount: rlsResult.data?.length || 0
            }
          });
        } catch (rlsError) {
          console.error('❌ RLS test failed:', rlsError);
          results.tests.push({
            name: 'RLS Policies',
            status: 'error',
            details: {
              error: rlsError instanceof Error ? rlsError.message : 'Unknown RLS error'
            }
          });
        }
      } else {
        results.tests.push({
          name: 'RLS Policies',
          status: 'warning',
          details: {
            message: 'Skipped - user not authenticated'
          }
        });
      }

      // Test 5: Write Operation Test (if user is authenticated)
      if (user) {
        console.log('🔍 Test 5: Testing write operations...');
        try {
          // Try to insert a test record and then delete it
          const testIntegration = {
            user_id: user.id,
            integration_type: 'test',
            api_key: 'test-key-' + Date.now(),
            database_id: null
          };

          const insertResult = await testWithTimeout(
            supabase
              .from('integrations')
              .insert([testIntegration])
              .select()
              .single(),
            5000,
            'Write operation timeout after 5 seconds'
          );

          if (!insertResult.error && insertResult.data) {
            // Clean up test record
            try {
              await testWithTimeout(
                supabase
                  .from('integrations')
                  .delete()
                  .eq('id', insertResult.data.id),
                3000,
                'Cleanup operation timeout'
              );
            } catch (cleanupError) {
              console.warn('⚠️ Failed to cleanup test record:', cleanupError);
            }

            results.tests.push({
              name: 'Write Operations',
              status: 'success',
              details: {
                canWrite: true,
                message: 'Insert and delete operations successful'
              }
            });
          } else {
            results.tests.push({
              name: 'Write Operations',
              status: 'error',
              details: {
                canWrite: false,
                error: insertResult.error?.message
              }
            });
          }
        } catch (writeError) {
          console.error('❌ Write test failed:', writeError);
          results.tests.push({
            name: 'Write Operations',
            status: 'error',
            details: {
              canWrite: false,
              error: writeError instanceof Error ? writeError.message : 'Unknown write error'
            }
          });
        }
      } else {
        results.tests.push({
          name: 'Write Operations',
          status: 'warning',
          details: {
            message: 'Skipped - user not authenticated'
          }
        });
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
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
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

        {isTestingConnection && (
          <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <Loader2 className="w-4 h-4 inline mr-1 animate-spin" />
              Running connection tests... This may take up to 30 seconds.
            </p>
          </div>
        )}

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

        {connectionStatus === 'error' && (
          <div className="bg-red-50 dark:bg-red-950 p-3 rounded-lg">
            <p className="text-sm text-red-800 dark:text-red-200">
              <XCircle className="w-4 h-4 inline mr-1" />
              Database connection failed. Your API keys will be stored in local storage until the connection is restored.
            </p>
          </div>
        )}

        {connectionStatus === 'success' && (
          <div className="bg-green-50 dark:bg-green-950 p-3 rounded-lg">
            <p className="text-sm text-green-800 dark:text-green-200">
              <CheckCircle className="w-4 h-4 inline mr-1" />
              Database connection successful! Your API keys will be stored securely in the database.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};