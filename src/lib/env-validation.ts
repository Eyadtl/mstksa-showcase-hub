/**
 * Environment variable validation
 * Validates required environment variables on application startup
 */

interface EnvConfig {
  VITE_SUPABASE_URL: string;
  VITE_SUPABASE_ANON_KEY: string;
  VITE_ADMIN_EMAIL: string;
}

/**
 * Validates that all required environment variables are present
 * Throws an error if any required variables are missing
 */
export const validateEnv = (): EnvConfig => {
  const requiredEnvVars = [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY',
    'VITE_ADMIN_EMAIL',
  ] as const;

  const missingVars: string[] = [];
  const envConfig: Partial<EnvConfig> = {};

  for (const varName of requiredEnvVars) {
    const value = import.meta.env[varName];
    
    if (!value || value === '') {
      missingVars.push(varName);
      console.error(`❌ Missing required environment variable: ${varName}`);
    } else {
      envConfig[varName] = value;
      console.log(`✅ ${varName} is configured`);
    }
  }

  if (missingVars.length > 0) {
    const errorMessage = `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️  ENVIRONMENT CONFIGURATION ERROR
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Missing required environment variables:
${missingVars.map(v => `  • ${v}`).join('\n')}

Please follow these steps:
1. Copy .env.example to .env
2. Fill in the required values
3. Restart the development server

For Supabase credentials, visit:
https://app.supabase.com/project/_/settings/api

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    `;
    
    throw new Error(errorMessage);
  }

  console.log('✅ All required environment variables are configured');
  return envConfig as EnvConfig;
};

/**
 * Get validated environment configuration
 */
export const getEnvConfig = (): EnvConfig => {
  return {
    VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
    VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY,
    VITE_ADMIN_EMAIL: import.meta.env.VITE_ADMIN_EMAIL,
  };
};
