import { Hono, type Context } from 'hono';
import { cors } from 'hono/cors';
import { init_db } from './utils/db_actions.ts';
import user from './routes/user.ts';
import post from './routes/post.ts';
import chat from './routes/chat.ts';
import notif from './routes/notif.ts';
import tag from './routes/tag.ts';
import seen from './routes/seen.ts';
import relation from './routes/relations.ts';
import research from "./routes/research.ts";
import report from "./routes/report.ts";
import date from "./routes/date.ts";
import social_media from "./routes/social_media.ts";
import type { JwtVariables } from 'hono/jwt';
import { Client } from 'https://deno.land/x/postgres@v0.19.3/client.ts';
import { connect } from 'https://deno.land/x/redis@v0.39.0/mod.ts';
import { ALLOWED_ORIGINS, DB_HOSTNAME, DB_NAME, DB_PASSWORD, DB_PORT, DB_USER, DENO_PORT, REDIS_HOSTNAME, REDIS_PORT, REDIS_PASSWORD } from './secret.ts';

const app = new Hono<{ Variables: JwtVariables }>();

app.use('*', (c: Context, next) => {
	if (c.req.header('upgrade')?.toLowerCase() === 'websocket') {
		return next();
	}
	return cors({
		origin: ALLOWED_ORIGINS,
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
	})(c, next);
});

app.route('/api/user', user);
app.route('/api/posts', post);
app.route('/api/chat', chat);
app.route('/api/notif', notif);
app.route('/api/tag', tag);
app.route('/api/relations', relation);
app.route('/api/seen', seen);
app.route('/api/research', research);
app.route('/api/report', report);
app.route('/api/date', date);
app.route('/api/social_media', social_media);

app.notFound((c: Context) => {
	return c.json({ message: 'Not Found' }, 404);
});

export const client = new Client({
	hostname: DB_HOSTNAME,
	port: parseInt(DB_PORT, 10),
	database: DB_NAME,
	user: DB_USER,
	password: DB_PASSWORD,
});

export const redis = await connect({
	hostname: REDIS_HOSTNAME,
	port: Number(REDIS_PORT),
	password: REDIS_PASSWORD,
});

export const relation_graph = 'relation_graph';
export const similarity_graph = 'similarity_graph';

try {
	await client.connect();
	await init_db();

	console.log('Connected to the database');

	Deno.serve({ port: DENO_PORT }, app.fetch);
} catch (e) {
	console.error(e);
}
