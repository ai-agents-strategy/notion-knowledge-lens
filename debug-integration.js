// Debug script to test integration saving
// Run this in browser console to debug the issue

console.log('🔍 Starting integration debug...');

// Test 1: Check current user
const checkUser = async () => {
  const { data: { user }, error } = await window.supabase.auth.getUser();
  console.log('Current user:', user);
  console.log('User ID:', user?.id);
  console.log('Auth UID:', await window.supabase.auth.getSession().then(s => s.data.session?.user?.id));
  return user;
};

// Test 2: Check RLS policies by trying to read integrations
const testRead = async (userId) => {
  console.log('Testing read access...');
  const { data, error } = await window.supabase
    .from('integrations')
    .select('*')
    .eq('user_id', userId);
  
  console.log('Read result:', { data, error });
  return { data, error };
};

// Test 3: Try to insert a test integration
const testInsert = async (userId) => {
  console.log('Testing insert access...');
  const { data, error } = await window.supabase
    .from('integrations')
    .insert({
      user_id: userId,
      integration_type: 'test',
      api_key: 'test-key-123'
    })
    .select();
  
  console.log('Insert result:', { data, error });
  return { data, error };
};

// Run all tests
const runDebug = async () => {
  try {
    const user = await checkUser();
    if (!user) {
      console.error('❌ No user found - please sign in first');
      return;
    }
    
    await testRead(user.id);
    await testInsert(user.id);
    
    console.log('✅ Debug complete');
  } catch (error) {
    console.error('❌ Debug failed:', error);
  }
};

// Make supabase available globally for testing
window.supabase = window.supabase || supabase;

// Run the debug
runDebug();
