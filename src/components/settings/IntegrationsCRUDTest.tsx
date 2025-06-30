import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useIntegrations } from "@/hooks/useIntegrations";
import { useAuth } from "@/hooks/useAuth";
import { 
  Database, 
  Plus, 
  Edit, 
  Trash2, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Eye,
  EyeOff
} from "lucide-react";

export const IntegrationsCRUDTest = () => {
  const { user } = useAuth();
  const { integrations, loading, getIntegration, saveIntegration, deleteIntegration, refetch } = useIntegrations();
  
  // Test data state
  const [testType, setTestType] = useState('test-integration');
  const [testApiKey, setTestApiKey] = useState('test-api-key-12345');
  const [testDatabaseId, setTestDatabaseId] = useState('test-db-id-67890');
  const [showApiKey, setShowApiKey] = useState(false);
  
  // Operation states
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRefetching, setIsRefetching] = useState(false);
  
  // Results tracking
  const [testResults, setTestResults] = useState<Array<{
    operation: string;
    status: 'success' | 'error' | 'pending';
    message: string;
    timestamp: string;
  }>>([]);

  const addTestResult = (operation: string, status: 'success' | 'error' | 'pending', message: string) => {
    const result = {
      operation,
      status,
      message,
      timestamp: new Date().toLocaleTimeString()
    };
    setTestResults(prev => [result, ...prev]);
    console.log(`[CRUD Test] ${operation}:`, { status, message });
  };

  // CREATE Test
  const testCreate = async () => {
    if (!user) {
      addTestResult('CREATE', 'error', 'No user authenticated');
      return;
    }

    setIsCreating(true);
    addTestResult('CREATE', 'pending', `Creating integration: ${testType}`);
    
    try {
      console.log('[CREATE Test] Starting with data:', {
        type: testType,
        apiKey: testApiKey.slice(0, 10) + '...',
        databaseId: testDatabaseId,
        userId: user.id
      });

      const success = await saveIntegration(testType, testApiKey, testDatabaseId);
      
      if (success) {
        addTestResult('CREATE', 'success', `Integration ${testType} created successfully`);
      } else {
        addTestResult('CREATE', 'error', 'Save operation returned false');
      }
    } catch (error) {
      console.error('[CREATE Test] Error:', error);
      addTestResult('CREATE', 'error', `Create failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsCreating(false);
    }
  };

  // READ Test
  const testRead = async () => {
    addTestResult('READ', 'pending', `Reading integration: ${testType}`);
    
    try {
      console.log('[READ Test] Current integrations:', integrations);
      
      const integration = getIntegration(testType);
      console.log('[READ Test] Found integration:', integration);
      
      if (integration) {
        addTestResult('READ', 'success', `Integration found: ${integration.integration_type} (ID: ${integration.id})`);
      } else {
        addTestResult('READ', 'error', `Integration ${testType} not found`);
      }
    } catch (error) {
      console.error('[READ Test] Error:', error);
      addTestResult('READ', 'error', `Read failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // UPDATE Test
  const testUpdate = async () => {
    if (!user) {
      addTestResult('UPDATE', 'error', 'No user authenticated');
      return;
    }

    const existingIntegration = getIntegration(testType);
    if (!existingIntegration) {
      addTestResult('UPDATE', 'error', `Integration ${testType} not found for update`);
      return;
    }

    setIsUpdating(true);
    const updatedApiKey = testApiKey + '-updated';
    const updatedDatabaseId = testDatabaseId + '-updated';
    
    addTestResult('UPDATE', 'pending', `Updating integration: ${testType}`);
    
    try {
      console.log('[UPDATE Test] Starting with data:', {
        type: testType,
        oldApiKey: testApiKey.slice(0, 10) + '...',
        newApiKey: updatedApiKey.slice(0, 10) + '...',
        oldDatabaseId: testDatabaseId,
        newDatabaseId: updatedDatabaseId
      });

      const success = await saveIntegration(testType, updatedApiKey, updatedDatabaseId);
      
      if (success) {
        setTestApiKey(updatedApiKey);
        setTestDatabaseId(updatedDatabaseId);
        addTestResult('UPDATE', 'success', `Integration ${testType} updated successfully`);
      } else {
        addTestResult('UPDATE', 'error', 'Update operation returned false');
      }
    } catch (error) {
      console.error('[UPDATE Test] Error:', error);
      addTestResult('UPDATE', 'error', `Update failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsUpdating(false);
    }
  };

  // DELETE Test
  const testDelete = async () => {
    if (!user) {
      addTestResult('DELETE', 'error', 'No user authenticated');
      return;
    }

    const existingIntegration = getIntegration(testType);
    if (!existingIntegration) {
      addTestResult('DELETE', 'error', `Integration ${testType} not found for deletion`);
      return;
    }

    setIsDeleting(true);
    addTestResult('DELETE', 'pending', `Deleting integration: ${testType}`);
    
    try {
      console.log('[DELETE Test] Deleting integration:', existingIntegration.id);

      const success = await deleteIntegration(testType);
      
      if (success) {
        addTestResult('DELETE', 'success', `Integration ${testType} deleted successfully`);
      } else {
        addTestResult('DELETE', 'error', 'Delete operation returned false');
      }
    } catch (error) {
      console.error('[DELETE Test] Error:', error);
      addTestResult('DELETE', 'error', `Delete failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsDeleting(false);
    }
  };

  // REFETCH Test
  const testRefetch = async () => {
    setIsRefetching(true);
    addTestResult('REFETCH', 'pending', 'Refetching all integrations');
    
    try {
      console.log('[REFETCH Test] Current integrations count:', integrations.length);
      
      await refetch();
      
      console.log('[REFETCH Test] After refetch integrations count:', integrations.length);
      addTestResult('REFETCH', 'success', `Refetch completed. Found ${integrations.length} integrations`);
    } catch (error) {
      console.error('[REFETCH Test] Error:', error);
      addTestResult('REFETCH', 'error', `Refetch failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsRefetching(false);
    }
  };

  // Run All Tests
  const runAllTests = async () => {
    console.log('[CRUD Test] Starting comprehensive CRUD test sequence');
    setTestResults([]);
    
    // Test sequence: CREATE -> READ -> UPDATE -> READ -> DELETE -> READ -> REFETCH
    await testCreate();
    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
    
    await testRead();
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await testUpdate();
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await testRead();
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await testDelete();
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await testRead();
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await testRefetch();
    
    console.log('[CRUD Test] All tests completed');
  };

  const clearResults = () => {
    setTestResults([]);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'pending':
        return <RefreshCw className="w-4 h-4 text-blue-600 animate-spin" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'pending':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  if (!user) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Please sign in to test CRUD operations.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="w-5 h-5" />
          Integrations CRUD Test Suite
        </CardTitle>
        <CardDescription>
          Comprehensive testing of Create, Read, Update, Delete operations for integrations.
          This will help identify any database or API issues.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Current State */}
        <div className="space-y-3">
          <h4 className="font-medium">Current State</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="p-3 bg-blue-50 rounded-lg">
              <div className="font-medium">User ID</div>
              <div className="text-blue-600 font-mono">{user.id.slice(0, 8)}...</div>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <div className="font-medium">Integrations Count</div>
              <div className="text-green-600 font-bold">{integrations.length}</div>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <div className="font-medium">Loading State</div>
              <div className="text-purple-600">{loading ? 'Loading...' : 'Ready'}</div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Test Configuration */}
        <div className="space-y-4">
          <h4 className="font-medium">Test Configuration</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="test-type">Integration Type</Label>
              <Input
                id="test-type"
                value={testType}
                onChange={(e) => setTestType(e.target.value)}
                placeholder="test-integration"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="test-api-key">API Key</Label>
              <div className="relative">
                <Input
                  id="test-api-key"
                  type={showApiKey ? "text" : "password"}
                  value={testApiKey}
                  onChange={(e) => setTestApiKey(e.target.value)}
                  placeholder="test-api-key"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowApiKey(!showApiKey)}
                >
                  {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="test-database-id">Database ID</Label>
              <Input
                id="test-database-id"
                value={testDatabaseId}
                onChange={(e) => setTestDatabaseId(e.target.value)}
                placeholder="test-db-id"
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Test Controls */}
        <div className="space-y-4">
          <h4 className="font-medium">Test Operations</h4>
          
          {/* Individual Tests */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
            <Button
              onClick={testCreate}
              disabled={isCreating || loading}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              {isCreating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Create
            </Button>
            
            <Button
              onClick={testRead}
              disabled={loading}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <Eye className="w-4 h-4" />
              Read
            </Button>
            
            <Button
              onClick={testUpdate}
              disabled={isUpdating || loading}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              {isUpdating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Edit className="w-4 h-4" />}
              Update
            </Button>
            
            <Button
              onClick={testDelete}
              disabled={isDeleting || loading}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              {isDeleting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              Delete
            </Button>
            
            <Button
              onClick={testRefetch}
              disabled={isRefetching || loading}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              {isRefetching ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              Refetch
            </Button>
            
            <Button
              onClick={clearResults}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <XCircle className="w-4 h-4" />
              Clear
            </Button>
          </div>

          {/* Run All Tests */}
          <div className="flex gap-2">
            <Button
              onClick={runAllTests}
              disabled={isCreating || isUpdating || isDeleting || isRefetching || loading}
              className="flex items-center gap-2"
            >
              <Database className="w-4 h-4" />
              Run All CRUD Tests
            </Button>
          </div>
        </div>

        <Separator />

        {/* Current Integrations */}
        <div className="space-y-3">
          <h4 className="font-medium">Current Integrations ({integrations.length})</h4>
          {integrations.length > 0 ? (
            <div className="space-y-2">
              {integrations.map((integration) => (
                <div key={integration.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">{integration.integration_type}</Badge>
                    <span className="text-sm text-gray-600">
                      ID: {integration.id.slice(0, 8)}...
                    </span>
                    <span className="text-sm text-gray-600">
                      API Key: {integration.api_key.slice(0, 10)}...
                    </span>
                    {integration.database_id && (
                      <span className="text-sm text-gray-600">
                        DB: {integration.database_id.slice(0, 10)}...
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(integration.created_at).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-gray-500">
              No integrations found
            </div>
          )}
        </div>

        <Separator />

        {/* Test Results */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Test Results ({testResults.length})</h4>
            {testResults.length > 0 && (
              <Button onClick={clearResults} variant="ghost" size="sm">
                Clear Results
              </Button>
            )}
          </div>
          
          {testResults.length > 0 ? (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {testResults.map((result, index) => (
                <div
                  key={index}
                  className={`p-3 border rounded-lg ${getStatusColor(result.status)}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(result.status)}
                      <Badge variant="outline" className="text-xs">
                        {result.operation}
                      </Badge>
                      <span className="text-sm">{result.message}</span>
                    </div>
                    <span className="text-xs opacity-70">{result.timestamp}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No test results yet. Run some tests to see results here.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};