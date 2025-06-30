import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export const SupabaseDebugTest = () => {
  const { user } = useAuth();
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const addResult = (message: string) => {
    console.log(message);
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const runTests = async () => {
    setIsLoading(true);
    setTestResults([]);
    
    try {
      addResult('🔍 Starting Supabase debug tests...');
      
      // Test 1: Check user authentication
      addResult(`👤 Current user: ${user ? user.id : 'None'}`);
      
      if (!user) {
        addResult('❌ No user authenticated - please sign in first');
        return;
      }

      // Test 2: Check auth session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
        addResult(`❌ Session error: ${sessionError.message}`);
      } else {
        addResult(`✅ Session valid: ${session?.user?.id || 'No session'}`);
      }

      // Test 3: Test database connection with a simple query
      addResult('🔍 Testing database connection...');
      const { data: testData, error: testError } = await supabase
        .from('integrations')
        .select('count')
        .limit(1);
      
      if (testError) {
        addResult(`❌ Database connection failed: ${testError.message}`);
      } else {
        addResult('✅ Database connection successful');
      }

      // Test 4: Test RLS policies - try to read integrations
      addResult('🔍 Testing RLS read access...');
      const { data: readData, error: readError } = await supabase
        .from('integrations')
        .select('*')
        .eq('user_id', user.id);
      
      if (readError) {
        addResult(`❌ RLS read failed: ${readError.message}`);
        addResult(`🔍 Error details: ${JSON.stringify(readError, null, 2)}`);
      } else {
        addResult(`✅ RLS read successful: Found ${readData?.length || 0} integrations`);
      }

      // Test 5: Test RLS policies - try to insert a test integration
      addResult('🔍 Testing RLS insert access...');
      const { data: insertData, error: insertError } = await supabase
        .from('integrations')
        .insert({
          user_id: user.id,
          integration_type: 'debug-test',
          api_key: 'test-key-' + Date.now()
        })
        .select();
      
      if (insertError) {
        addResult(`❌ RLS insert failed: ${insertError.message}`);
        addResult(`🔍 Error details: ${JSON.stringify(insertError, null, 2)}`);
      } else {
        addResult(`✅ RLS insert successful: ${JSON.stringify(insertData)}`);
        
        // Clean up test data
        if (insertData && insertData[0]) {
          await supabase
            .from('integrations')
            .delete()
            .eq('id', insertData[0].id);
          addResult('🧹 Cleaned up test data');
        }
      }

      // Test 6: Check auth.uid() function
      addResult('🔍 Testing auth.uid() function...');
      const { data: uidData, error: uidError } = await supabase
        .rpc('get_clerk_user_id');
      
      if (uidError) {
        addResult(`❌ auth.uid() test failed: ${uidError.message}`);
      } else {
        addResult(`✅ auth.uid() returned: ${uidData}`);
        addResult(`🔍 User ID comparison: user.id=${user.id}, auth.uid()=${uidData}`);
      }

      // Test 7: Debug user info function
      addResult('🔍 Testing debug_user_info function...');
      try {
        const { data: debugData, error: debugError } = await supabase
          .rpc('debug_user_info' as any);
        
        if (debugError) {
          addResult(`❌ debug_user_info failed: ${debugError.message}`);
        } else {
          addResult(`✅ debug_user_info returned: ${JSON.stringify(debugData)}`);
          if (debugData && Array.isArray(debugData) && debugData.length > 0) {
            const info = debugData[0] as any;
            addResult(`🔍 Auth UID (text): ${info.auth_uid}`);
            addResult(`🔍 Auth UID (uuid): ${info.auth_uid_uuid}`);
            addResult(`🔍 Session User: ${info.session_user}`);
          }
        }
      } catch (rpcError) {
        addResult(`❌ debug_user_info RPC error: ${rpcError instanceof Error ? rpcError.message : 'Unknown error'}`);
      }

    } catch (error) {
      addResult(`❌ Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
      addResult('✅ Debug tests completed');
    }
  };

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle>🔧 Supabase Debug Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={runTests} disabled={isLoading}>
          {isLoading ? 'Running Tests...' : 'Run Debug Tests'}
        </Button>
        
        {testResults.length > 0 && (
          <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
            <h4 className="font-medium mb-2">Test Results:</h4>
            <div className="space-y-1 max-h-96 overflow-y-auto">
              {testResults.map((result, index) => (
                <div key={index} className="text-xs font-mono text-gray-700 dark:text-gray-300">
                  {result}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
