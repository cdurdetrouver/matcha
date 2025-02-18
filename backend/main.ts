import { Hono } from 'hono';
import { cors } from 'hono/cors';

const app = new Hono();

// Liste des origines autorisées (équivalent à ALLOWED_HOSTS)
const allowedOrigins = [
  'http://localhost',
  'http://127.0.0.1',
];

// Middleware CORS
app.use('*', async (c, next) => {
  const corsMiddleware = cors({
    origin: c.env.APP_URL,
    allowedHeaders: ['Origin', 'Content-Type', 'Authorization'],
    allowMethods: ['GET', 'OPTIONS', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  })
  return await corsMiddleware(c, next)
})

// Exemple de route
app.get('/api/', (c) => c.json({ message: 'Hello, World!' }));

Deno.serve(app.fetch);
