import { Hono } from 'hono';
import { cors } from 'hono/cors';

const app = new Hono();

app.use('/api/', async (c, next) => {
    const corsMiddleware = cors({
      origin: ['http://localhost:5173'],
      allowedHeaders: ['Origin', 'Content-Type', 'Authorization', 'X-Custom-Header', 'Upgrade-Insecure-Requests'],
      allowMethods: ['GET', 'OPTIONS', 'POST', 'PUT', 'DELETE'],
      exposeHeaders: ['Content-Length', 'X-Kuma-Revision'],
      maxAge: 600,
      credentials: true,
    });
    return corsMiddleware(c, next);
});


app.get('/api/', (c) => {return c.json({ message: 'Hello, WoGabrielrld changed!' })});

Deno.serve(app.fetch);