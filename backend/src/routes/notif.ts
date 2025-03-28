import { Hono, type Context } from 'hono';
import { upgradeWebSocket } from 'hono/deno';
import { check_cookies } from '../utils/jwt.ts';

const app = new Hono();

app.get(
	'/ws',
	upgradeWebSocket(async (c) => {
		const ret_check = await check_cookies(c);

		return {
			onOpen: (_event, ws) => {
				if (ret_check.user == null) {
					ws.send('Server cannot perform checks !');
					ws.close();
					return;
				}
				console.log(ret_check);
				console.log('Connection opened');
				ws.send('Hello from server!');
			},
			onMessage(event, ws) {
				console.log(`Message from client: ${event.data}`);
				ws.send('Hello from server!');
			},
			onClose: () => {
				console.log('Connection closed');
			},
		};
	})
);

app.notFound((c: Context) => {
	return c.json({ message: 'Route not Found' }, 404);
});

export default app;
