import { SignatureKey } from "hono/utils/jwt/jws";
import 'https://deno.land/x/dotenv@v3.2.2/load.ts';

export const JWT_SECRET = Deno.env.get('JWT_SECRET') as SignatureKey ?? 'JWT_SECRET';
export const BUCKET_NAME = Deno.env.get('BUCKET_NAME') ?? 'BUCKET_NAME';