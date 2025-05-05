import { SignatureKey } from 'hono/utils/jwt/jws';
import 'https://deno.land/x/dotenv@v3.2.2/load.ts';

export const JWT_SECRET =
	(Deno.env.get('JWT_SECRET') as SignatureKey) ?? 'JWT_SECRET';
export const BUCKET_NAME = Deno.env.get('BUCKET_NAME') ?? 'BUCKET_NAME';
export const FRONTEND_URL = Deno.env.get('FRONTEND_URL') ?? 'FRONTEND_URL';
export const GMAIL_PASS = Deno.env.get('GMAIL_PASS') ?? 'GMAIL_PASS';
export const GMAIL_EMAIL = Deno.env.get('GMAIL_EMAIL') ?? 'GMAIL_EMAIL';
export const INTRA_API_KEY = Deno.env.get('INTRA_API_KEY') ?? 'INTRA_API_KEY';
export const INTRA_API_SECRET =
	Deno.env.get('INTRA_API_SECRET') ?? 'INTRA_API_SECRET';
export const INTRA_API_REDIRECT_URL =
	Deno.env.get('INTRA_API_REDIRECT_URL') ?? 'INTRA_API_REDIRECT_URL';
export const GOOGLE_ID = Deno.env.get('GOOGLE_ID') ?? 'GOOGLE_ID';
export const GOOGLE_SECRET = Deno.env.get('GOOGLE_SECRET') ?? 'GOOGLE_SECRET';
export const GOOGLE_REDIRECT_URI =
	Deno.env.get('GOOGLE_REDIRECT_URI') ?? 'GOOGLE_REDIRECT_URI';
export const X_BARREER_API_KEY = 
	Deno.env.get('X_BARREER_API_KEY') ?? 'X_BARREER_API_KEY';
