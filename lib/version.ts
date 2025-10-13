// Import version directly from package.json
import packageJson from '../package.json';

export const APP_VERSION = packageJson.version;

export function getAppVersion(): string {
  // Try to get version from environment variable first
  if (process.env.NEXT_PUBLIC_APP_VERSION) {
    return process.env.NEXT_PUBLIC_APP_VERSION;
  }
  
  // Return version from package.json
  return APP_VERSION;
}