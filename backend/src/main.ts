import { Hono, type Context } from 'hono';
import { cors } from 'hono/cors';
import { db_connect, db_init } from './utils/db_actions.ts';
import user from './routes/user.ts';
import chat from './routes/chat.ts';
import upload from './routes/upload.ts';
import type { JwtVariables } from 'hono/jwt';
import { SignatureKey } from "hono/utils/jwt/jws";

const app = new Hono<{ Variables: JwtVariables }>();

export const JWT_SECRET = Deno.env.get('JWT_SECRET') as SignatureKey ?? 'JWT_SECRET';
export const BUCKET_NAME = Deno.env.get('BUCKET_NAME') ?? 'BUCKET_NAME';

const allowedOrigin = 'http://localhost:5173';

app.use('*', cors({
	origin: allowedOrigin,
	allowHeaders: ['Origin', 'Content-Type', 'Authorization', 'X-Custom-Header', 'Upgrade-Insecure-Requests', "Access-Control-Allow-Origin"],
	allowMethods: ['GET', 'OPTIONS', 'POST', 'PUT', 'DELETE'],
	exposeHeaders: ['Content-Length', 'X-Kuma-Revision'],
	maxAge: 600,
	credentials: true,
  })
);

app.route('/api/user', user);

app.route('/api/chat', chat);

app.route('/upload', upload);

app.notFound((c:Context) => {
	return c.json({ message: 'Not Found' }, 404)
});

export const client = await db_connect();

if (client && await db_init())
	console.log("Successful database connection and initialization !");
else
	console.log("Connection or initialization of the database failed !");

Deno.serve(app.fetch);
