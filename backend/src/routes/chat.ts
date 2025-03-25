import { Hono, type Context } from "hono";

const app = new Hono()

app.notFound((c:Context) => {
	return c.json({ message: 'Route not Found' }, 404)
});

export default app
