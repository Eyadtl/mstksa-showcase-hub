/**
 * Debug component to check environment variables
 * Remove this after debugging
 */
export const EnvDebug = () => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const hasAnonKey = !!import.meta.env.VITE_SUPABASE_ANON_KEY;
  
  return (
    <div style={{ 
      position: 'fixed', 
      bottom: 10, 
      right: 10, 
      background: 'black', 
      color: 'white', 
      padding: '10px',
      fontSize: '12px',
      zIndex: 9999,
      borderRadius: '5px'
    }}>
      <div>Supabase URL: {supabaseUrl || '❌ MISSING'}</div>
      <div>Has Anon Key: {hasAnonKey ? '✅ YES' : '❌ NO'}</div>
    </div>
  );
};
