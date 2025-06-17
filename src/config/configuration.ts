import { config } from 'dotenv';
import * as path from 'path';

// Chargement dynamique du bon fichier .env
const envFile = `.env.${process.env.NODE_ENV || 'development'}`;
config({ path: path.resolve(process.cwd(), envFile) });

// Définir une URL frontend par défaut si non spécifiée dans le .env
const defaultFrontendUrl =
  process.env.NODE_ENV === 'production'
    ? 'https://keylity.ch'
    : 'http://localhost:4000';

export default () => ({
  port: parseInt(process.env.PORT, 10) || 3000,

  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRATION || '1d',
  },

  supabase: {
    url: process.env.SUPABASE_URL,
    key: process.env.SUPABASE_KEY,
    serviceKey: process.env.SUPABASE_SERVICE_KEY,
  },

  throttle: {
    ttl: parseInt(process.env.THROTTLE_TTL, 10) || 60,
    limit: parseInt(process.env.THROTTLE_LIMIT, 10) || 10,
  },

  app: {
    frontendUrl: process.env.FRONTEND_URL || defaultFrontendUrl,
  },
});
