/**
 * Environment Configuration
 * Centralized configuration management for different environments
 */

export type Environment = 'development' | 'staging' | 'production' | 'docker';
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface EnvironmentConfig {
  // Environment
  NODE_ENV: string;
  APP_ENV: Environment;
  
  // API Configuration
  API_BASE_URL: string;
  WS_URL: string;
  
  // Feature Flags
  ENABLE_DEBUG: boolean;
  ENABLE_DEVTOOLS: boolean;
  ENABLE_MOCK_DATA: boolean;
  
  // Logging
  LOG_LEVEL: LogLevel;
  ENABLE_API_LOGGING: boolean;
  
  // Performance
  API_TIMEOUT: number;
  ENABLE_CACHE: boolean;
  
  // Security
  ENABLE_HTTPS: boolean;
  STRICT_MODE: boolean;
  
  // External Services
  SENTRY_DSN?: string;
  ANALYTICS_ID?: string;
}

/**
 * Get environment variable with type safety and default values
 */
function getEnvVar(key: string, defaultValue: string = ''): string {
  return import.meta.env[key] || defaultValue;
}

function getEnvBoolean(key: string, defaultValue: boolean = false): boolean {
  const value = getEnvVar(key);
  if (value === '') return defaultValue;
  return value.toLowerCase() === 'true';
}

function getEnvNumber(key: string, defaultValue: number = 0): number {
  const value = getEnvVar(key);
  if (value === '') return defaultValue;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
}

/**
 * Current environment configuration
 */
export const config: EnvironmentConfig = {
  // Environment
  NODE_ENV: getEnvVar('VITE_NODE_ENV', 'development'),
  APP_ENV: getEnvVar('VITE_APP_ENV', 'development') as Environment,
  
  // API Configuration
  API_BASE_URL: getEnvVar('VITE_API_BASE_URL', 'http://localhost:5131/api'),
  WS_URL: getEnvVar('VITE_WS_URL', 'ws://localhost:5131/stockflowhub'),
  
  // Feature Flags
  ENABLE_DEBUG: getEnvBoolean('VITE_ENABLE_DEBUG', true),
  ENABLE_DEVTOOLS: getEnvBoolean('VITE_ENABLE_DEVTOOLS', true),
  ENABLE_MOCK_DATA: getEnvBoolean('VITE_ENABLE_MOCK_DATA', false),
  
  // Logging
  LOG_LEVEL: getEnvVar('VITE_LOG_LEVEL', 'debug') as LogLevel,
  ENABLE_API_LOGGING: getEnvBoolean('VITE_ENABLE_API_LOGGING', true),
  
  // Performance
  API_TIMEOUT: getEnvNumber('VITE_API_TIMEOUT', 10000),
  ENABLE_CACHE: getEnvBoolean('VITE_ENABLE_CACHE', false),
  
  // Security
  ENABLE_HTTPS: getEnvBoolean('VITE_ENABLE_HTTPS', false),
  STRICT_MODE: getEnvBoolean('VITE_STRICT_MODE', false),
  
  // External Services
  SENTRY_DSN: getEnvVar('VITE_SENTRY_DSN'),
  ANALYTICS_ID: getEnvVar('VITE_ANALYTICS_ID'),
};

/**
 * Environment checks
 */
export const isDevelopment = config.APP_ENV === 'development';
export const isStaging = config.APP_ENV === 'staging';
export const isProduction = config.APP_ENV === 'production';
export const isDocker = config.APP_ENV === 'docker';

/**
 * Debug logging (only in development/staging)
 */
export const debugLog = (message: string, ...args: any[]) => {
  if (config.ENABLE_DEBUG && (isDevelopment || isStaging)) {
    console.log(`[${config.APP_ENV.toUpperCase()}] ${message}`, ...args);
  }
};

/**
 * API logging (configurable per environment)
 */
export const apiLog = (message: string, ...args: any[]) => {
  if (config.ENABLE_API_LOGGING) {
    console.log(`[API] ${message}`, ...args);
  }
};

/**
 * Display environment information in console with BIG HIGHLIGHT
 */
export const displayEnvironmentInfo = (): void => {
  const getEnvironmentIcon = () => {
    switch (config.APP_ENV) {
      case 'development': return '🔧';
      case 'staging': return '🚧';
      case 'production': return '🚀';
      case 'docker': return '🐳';
      default: return '❓';
    }
  };

  const getEnvironmentStyles = () => {
    switch (config.APP_ENV) {
      case 'development': 
        return {
          banner: 'background: linear-gradient(90deg, #3b82f6, #1d4ed8); color: white; font-size: 24px; font-weight: bold; padding: 15px 30px; border-radius: 10px; text-shadow: 2px 2px 4px rgba(0,0,0,0.3);',
          highlight: 'background: #3b82f6; color: white; font-size: 18px; font-weight: bold; padding: 8px 16px; border-radius: 5px;',
          accent: 'color: #3b82f6; font-weight: bold; font-size: 16px;'
        };
      case 'staging': 
        return {
          banner: 'background: linear-gradient(90deg, #f59e0b, #d97706); color: white; font-size: 24px; font-weight: bold; padding: 15px 30px; border-radius: 10px; text-shadow: 2px 2px 4px rgba(0,0,0,0.3);',
          highlight: 'background: #f59e0b; color: white; font-size: 18px; font-weight: bold; padding: 8px 16px; border-radius: 5px;',
          accent: 'color: #f59e0b; font-weight: bold; font-size: 16px;'
        };
      case 'production': 
        return {
          banner: 'background: linear-gradient(90deg, #ef4444, #dc2626); color: white; font-size: 24px; font-weight: bold; padding: 15px 30px; border-radius: 10px; text-shadow: 2px 2px 4px rgba(0,0,0,0.3);',
          highlight: 'background: #ef4444; color: white; font-size: 18px; font-weight: bold; padding: 8px 16px; border-radius: 5px;',
          accent: 'color: #ef4444; font-weight: bold; font-size: 16px;'
        };
      case 'docker': 
        return {
          banner: 'background: linear-gradient(90deg, #8b5cf6, #7c3aed); color: white; font-size: 24px; font-weight: bold; padding: 15px 30px; border-radius: 10px; text-shadow: 2px 2px 4px rgba(0,0,0,0.3);',
          highlight: 'background: #8b5cf6; color: white; font-size: 18px; font-weight: bold; padding: 8px 16px; border-radius: 5px;',
          accent: 'color: #8b5cf6; font-weight: bold; font-size: 16px;'
        };
      default: 
        return {
          banner: 'background: #6b7280; color: white; font-size: 24px; font-weight: bold; padding: 15px 30px; border-radius: 10px;',
          highlight: 'background: #6b7280; color: white; font-size: 18px; font-weight: bold; padding: 8px 16px; border-radius: 5px;',
          accent: 'color: #6b7280; font-weight: bold; font-size: 16px;'
        };
    }
  };

  const styles = getEnvironmentStyles();
  const resetStyle = 'color: inherit; font-weight: normal;';
  const headerStyle = 'color: #1f2937; font-weight: bold; font-size: 16px; text-decoration: underline;';
  const labelStyle = 'color: #6b7280; font-weight: normal; font-size: 14px;';
  const valueStyle = 'color: #1f2937; font-weight: bold; font-size: 14px;';
  const successStyle = 'color: #10b981; font-weight: bold;';
  const errorStyle = 'color: #ef4444; font-weight: bold;';

  // Clear console and add dramatic spacing
  console.clear();
  console.log('\n\n\n');
  
  // BIG ENVIRONMENT BANNER
  console.log('%c' + '█'.repeat(100), 'color: #e5e7eb;');
  console.log('%c' + '█'.repeat(100), 'color: #e5e7eb;');
  console.log(`%c${getEnvironmentIcon()} STOCKFLOW-PRO RUNNING IN ${config.APP_ENV.toUpperCase()} ENVIRONMENT ${getEnvironmentIcon()}`, styles.banner);
  console.log('%c' + '█'.repeat(100), 'color: #e5e7eb;');
  console.log('%c' + '█'.repeat(100), 'color: #e5e7eb;');
  
  console.log('\n');
  
  // Environment highlight box
  console.log('%c🎯 CURRENT ENVIRONMENT', styles.highlight);
  console.log(`%cEnvironment:%c %c${config.APP_ENV.toUpperCase()}`, labelStyle, resetStyle, styles.accent);
  console.log(`%cNode Environment:%c %c${config.NODE_ENV}`, labelStyle, resetStyle, valueStyle);
  console.log(`%cAPI Base URL:%c %c${config.API_BASE_URL}`, labelStyle, resetStyle, valueStyle);
  console.log(`%cWebSocket URL:%c %c${config.WS_URL}`, labelStyle, resetStyle, valueStyle);
  
  console.log('\n%c🚀 FEATURE FLAGS', headerStyle);
  console.log(`%c  Debug Mode:%c %c${config.ENABLE_DEBUG ? '✅ ENABLED' : '❌ DISABLED'}`, labelStyle, resetStyle, config.ENABLE_DEBUG ? successStyle : errorStyle);
  console.log(`%c  DevTools:%c %c${config.ENABLE_DEVTOOLS ? '✅ ENABLED' : '❌ DISABLED'}`, labelStyle, resetStyle, config.ENABLE_DEVTOOLS ? successStyle : errorStyle);
  console.log(`%c  API Logging:%c %c${config.ENABLE_API_LOGGING ? '✅ ENABLED' : '❌ DISABLED'}`, labelStyle, resetStyle, config.ENABLE_API_LOGGING ? successStyle : errorStyle);
  console.log(`%c  Cache:%c %c${config.ENABLE_CACHE ? '✅ ENABLED' : '❌ DISABLED'}`, labelStyle, resetStyle, config.ENABLE_CACHE ? successStyle : errorStyle);
  
  console.log('\n%c⚙️ CONFIGURATION', headerStyle);
  console.log(`%c  Log Level:%c %c${config.LOG_LEVEL.toUpperCase()}`, labelStyle, resetStyle, valueStyle);
  console.log(`%c  API Timeout:%c %c${config.API_TIMEOUT}ms`, labelStyle, resetStyle, valueStyle);
  console.log(`%c  HTTPS:%c %c${config.ENABLE_HTTPS ? '✅ ENABLED' : '❌ DISABLED'}`, labelStyle, resetStyle, config.ENABLE_HTTPS ? successStyle : errorStyle);
  console.log(`%c  Strict Mode:%c %c${config.STRICT_MODE ? '✅ ENABLED' : '❌ DISABLED'}`, labelStyle, resetStyle, config.STRICT_MODE ? successStyle : errorStyle);

  if (config.SENTRY_DSN || config.ANALYTICS_ID) {
    console.log('\n%c🔌 EXTERNAL SERVICES', headerStyle);
    if (config.SENTRY_DSN) {
      console.log(`%c  Sentry:%c %c✅ CONFIGURED`, labelStyle, resetStyle, successStyle);
    }
    if (config.ANALYTICS_ID) {
      console.log(`%c  Analytics:%c %c✅ CONFIGURED`, labelStyle, resetStyle, successStyle);
    }
  }

  console.log('\n' + '═'.repeat(80));
  
  // Environment-specific BIG messages
  if (isDevelopment) {
    console.log(`%c💡 DEVELOPMENT MODE ACTIVE`, 'background: #3b82f6; color: white; font-size: 16px; font-weight: bold; padding: 10px 20px; border-radius: 8px;');
    console.log(`%c   🔥 Hot reload is ACTIVE`, 'color: #10b981; font-weight: bold; font-size: 14px;');
    console.log(`%c   🛠️ Debug tools are AVAILABLE`, 'color: #10b981; font-weight: bold; font-size: 14px;');
    console.log(`%c   📊 API requests are LOGGED`, 'color: #10b981; font-weight: bold; font-size: 14px;');
  } else if (isStaging) {
    console.log(`%c🚧 STAGING ENVIRONMENT ACTIVE`, 'background: #f59e0b; color: white; font-size: 16px; font-weight: bold; padding: 10px 20px; border-radius: 8px;');
    console.log(`%c   ⚠️ This is a PRE-PRODUCTION environment`, 'color: #f59e0b; font-weight: bold; font-size: 14px;');
    console.log(`%c   🧪 Debug tools are ENABLED for testing`, 'color: #f59e0b; font-weight: bold; font-size: 14px;');
  } else if (isProduction) {
    console.log(`%c🚀 PRODUCTION ENVIRONMENT ACTIVE`, 'background: #ef4444; color: white; font-size: 16px; font-weight: bold; padding: 10px 20px; border-radius: 8px;');
    console.log(`%c   🔒 Debug mode is DISABLED`, 'color: #ef4444; font-weight: bold; font-size: 14px;');
    console.log(`%c   ⚡ Performance optimizations are ACTIVE`, 'color: #ef4444; font-weight: bold; font-size: 14px;');
  } else if (isDocker) {
    console.log(`%c🐳 DOCKER ENVIRONMENT ACTIVE`, 'background: #8b5cf6; color: white; font-size: 16px; font-weight: bold; padding: 10px 20px; border-radius: 8px;');
    console.log(`%c   📦 Running in CONTAINERIZED environment`, 'color: #8b5cf6; font-weight: bold; font-size: 14px;');
    console.log(`%c   🛠️ Debug tools are ENABLED`, 'color: #8b5cf6; font-weight: bold; font-size: 14px;');
  }

  console.log('\n' + '═'.repeat(80));
  console.log('%c🎉 APPLICATION READY TO USE!', 'background: #10b981; color: white; font-size: 18px; font-weight: bold; padding: 12px 24px; border-radius: 10px;');
  console.log('\n\n');
};

/**
 * Environment validation
 */
export const validateEnvironment = (): void => {
  const requiredVars = [
    'VITE_API_BASE_URL',
    'VITE_WS_URL',
  ];

  const missing = requiredVars.filter(varName => !getEnvVar(varName));
  
  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:', missing);
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  // Display environment information
  displayEnvironmentInfo();
};

/**
 * Get environment-specific configuration
 */
export const getEnvironmentConfig = () => config;

// Validate environment on module load
validateEnvironment();