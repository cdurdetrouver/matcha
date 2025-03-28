import { Hono, type Context } from 'hono';

const app = new Hono();

// app.get('/ws', (c) => {
// 	const { response, socket } = Deno.upgradeWebSocket(c.req.raw);
// 	socket.onopen = () => {
// 		console.log('WebSocket connection opened');
// 		socket.send('Welcome to Hono WebSocket!');
// 	};
// 	socket.onmessage = (event) => {
// 		console.log('Received:', event.data);
// 		socket.send(`Server received: ${event.data}`);
// 	};
// 	socket.onclose = () => {
// 		console.log('WebSocket connection closed');
// 	};
// 	socket.onerror = (error) => {
// 		console.error('WebSocket error:', error);
// 	};
// 	return response;
// });

app.notFound((c: Context) => {
	return c.json({ message: 'Route not Found' }, 404);
});

export default app;
