import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { user } from './user.ts';
import { db_connect, db_obj_init } from './db_actions.ts';

const app = new Hono();

let client = await db_connect();

if (client)
    console.log("Connected to database!");
else
    console.log("Failed to connect to database!");

app.use('*', async (c, next) => {
    const corsMiddleware = cors({
      origin: ['http://localhost:5173'],
      allowHeaders: ['Origin', 'Content-Type', 'Authorization', 'X-Custom-Header', 'Upgrade-Insecure-Requests'],
      allowMethods: ['GET', 'OPTIONS', 'POST', 'PUT', 'DELETE'],
      exposeHeaders: ['Content-Length', 'X-Kuma-Revision'],
      maxAge: 600,
      credentials: true,
    });
    return corsMiddleware(c, next);
});


app.get('/api/', (c) => {return c.json({ message: 'Hello, World changed!' })});

app.post('/api/create_user', async (c) => {
  const body = await c.req.json();

  let user_test = new user(body.id, body.username, body.password, body.email);
  const contraints = [";SERIAL PRIMARY KEY", "VARCHAR(255) NOT NULL",  "VARCHAR(255) NOT NULL",  "VARCHAR(255) NOT NULL", "TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP"];
  
  user_test.print_info();
  console.log(body, " || ", JSON.stringify(user_test));
  db_obj_init("user", user_test, contraints, client);
  return c.json({ message: 'User created!', body })
});

Deno.serve(app.fetch);