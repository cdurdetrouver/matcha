import { SignatureKey } from 'hono/utils/jwt/jws';
import 'https://deno.land/x/dotenv@v3.2.2/load.ts';

export const JWT_SECRET =
	(Deno.env.get('JWT_SECRET') as SignatureKey) ?? 'JWT_SECRET';
export const BUCKET_NAME = Deno.env.get('BUCKET_NAME') ?? 'BUCKET_NAME';
export const FRONTEND_URL = Deno.env.get('FRONTEND_URL') ?? 'FRONTEND_URL';
export const GMAIL_PASS = Deno.env.get('GMAIL_PASS') ?? 'GMAIL_PASS';
export const GMAIL_EMAIL = Deno.env.get('GMAIL_EMAIL') ?? 'GMAIL_EMAIL';
