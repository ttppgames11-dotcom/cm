import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
if (process.env.NODE_ENV !== 'production' && !process.env.JWT_SECRET) {
  dotenv.config({ path: path.join(__dirname, '..', '.env') });
  dotenv.config();
}

const isProduction = process.env.NODE_ENV === 'production';
const envSecret = process.env.JWT_SECRET;

// In production, enforce that JWT_SECRET is explicitly configured, non-empty, and secure.
if (isProduction) {
  if (!envSecret || envSecret === 'connect_maratha_secret_key_2026' || envSecret.length < 32) {
    throw new Error(
      'FATAL SECURITY CONFIGURATION ERROR: process.env.JWT_SECRET must be explicitly set to a secure string (minimum 32 characters) in production. Server startup aborted.'
    );
  }
}

export const JWT_SECRET = envSecret || 'dev_secret_connect_maratha_local_only_2026';

if (!envSecret && !isProduction && process.env.NODE_ENV !== 'test') {
  console.warn('⚠️ [SECURITY WARNING] process.env.JWT_SECRET is not set. Using local development secret. DO NOT USE IN PRODUCTION.');
}

export default JWT_SECRET;
