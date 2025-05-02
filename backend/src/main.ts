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
import type { JwtVariables } from 'hono/jwt';
import { Client } from 'https://deno.land/x/postgres@v0.19.3/client.ts';
import { connect } from 'https://deno.land/x/redis@v0.39.0/mod.ts';
import { Tags_Users } from './db_objects/tags_users.ts';
import { Tag } from './db_objects/tags.ts';

const app = new Hono<{ Variables: JwtVariables }>();

const allowedOrigin = ['http://localhost:5173', 'ws://localhost:5173'];

app.use('*', (c, next) => {
	if (c.req.header('upgrade')?.toLowerCase() === 'websocket') {
		return next();
	}
	return cors({
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

export const redis = await connect({
	hostname: 'redisgraph',
	port: 6379,
});
//https://redis.io/docs/latest/operate/oss_and_stack/stack-with-enterprise/deprecated-features/graph/commands/

export const relation_graph = 'relation_graph';
export const similarity_graph = 'similarity_graph';

try {
	await client.connect();
	await init_db();

	try {
		await Tag.create('test2');
		await Tag.create('test');
	} catch (_e) {
		console.log('Tags already created');
	}
	await Tags_Users.add_tags(1, ['test', 'test2']);

	console.log('Connected to the database');

	Deno.serve({ port: 8000 }, app.fetch);
} catch (e) {
	console.error(e);
}
