import { Hono, type Context } from 'hono';
import { cors } from 'hono/cors';
import { init_db } from './utils/db_actions.ts';
import user from './routes/user.ts';
import chat from './routes/chat.ts';
import type { JwtVariables } from 'hono/jwt';
import { Client } from 'https://deno.land/x/postgres@v0.19.3/client.ts';

const app = new Hono<{ Variables: JwtVariables }>();

const allowedOrigin = 'http://localhost:5173';

app.use(
	'*',
	cors({
		origin: allowedOrigin,
		allowHeaders: [
			'Origin',
			'Content-Type',
			'Authorization',
			'X-Custom-Header',
			'Upgrade-Insecure-Requests',
			'Access-Control-Allow-Origin',
		],
		allowMethods: ['GET', 'OPTIONS', 'POST', 'PUT', 'DELETE'],
		exposeHeaders: ['Content-Length', 'X-Kuma-Revision'],
		maxAge: 600,
		credentials: true,
	})
);

app.route('/api/user', user);

app.route('/api/chat', chat);

app.notFound((c: Context) => {
	return c.json({ message: 'Not Found' }, 404);
});

export const client = new Client({
	hostname: 'db',
	port: 5432,
	database: 'matcha',
	user: 'postgresuser',
	password: 'postgrespassword',
});

try {
	await client.connect();
	await init_db();
	console.log('Connected to the database');

	Deno.serve(app.fetch);
} catch (e) {
	console.error(e);
}
