import { config } from 'dotenv';
import * as path from 'path';

// Charger le bon fichier .env selon l'environnement
const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env.development';
config({ path: path.resolve(process.cwd(), envFile) });

export default () => ({
  port: parseInt(process.env.PORT, 10) || 3000,
  supabase: {
    url: process.env.SUPABASE_URL,
    key: process.env.SUPABASE_KEY,
    serviceKey: process.env.SUPABASE_SERVICE_KEY,
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRATION,
  },
  throttle: {
    ttl: parseInt(process.env.THROTTLE_TTL, 10) || 60,
    limit: parseInt(process.env.THROTTLE_LIMIT, 10) || 10,
  },
}); 