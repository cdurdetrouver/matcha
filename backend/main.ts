import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { user, user_serializer } from './user.ts';
import { db_connect, db_init, db_print_table, db_post_obj, db_get_number_obj, db_get_obj, db_delete_obj, db_put_obj } from './db_actions.ts';

const app = new Hono();

let client = await db_connect();

if (client && await db_init(client))
    console.log("Successful database connection and initialization !");
else
    console.log("Connection or initialization of the database failed !");

app.use('*', async (c, next) => {
    const corsMiddleware = cors({
      origin: ['*', 'http://localhost:5173'],
      allowHeaders: ['Origin', 'Content-Type', 'Authorization', 'X-Custom-Header', 'Upgrade-Insecure-Requests'],
      allowMethods: ['GET', 'OPTIONS', 'POST', 'PUT', 'DELETE'],
      exposeHeaders: ['Content-Length', 'X-Kuma-Revision'],
      maxAge: 600,
      credentials: true,
    });
    return corsMiddleware(c, next);
});

app.get('/api/', (c) => {return c.json({ message: 'Hello, World changed!' })});

app.post('/api/user', async (c) => {
  const body = await c.req.json();

  let user_test = new user(body.username, body.password, body.email);  
  const ret_user = db_post_obj("user", user_test, client);
  if (ret_user == -1)
      return c.json({ message: 'User creation failed!'}, 500);
  return c.json({ message: 'User created!'}, 200)
});

app.put('/api/user/:id', async (c) => {
  const id = await c.req.param('id');
  const body = await c.req.json();
  const user_info = await db_get_obj("user", id, client);

  if (user_info == -1)
      return c.json({ message: 'User not found!'}, 404);

  let user_test = new user(body.username, body.password, body.email);  
  const ret_user = db_put_obj("user", id, client, user_test);
  if (ret_user == -1)
      return c.json({ message: 'User update failed!'}, 500);
  return c.json({ message: 'User updated!'}, 200)
});

app.get('/api/user/:id', async (c) => {
  const id = await c.req.param('id');
  let user_info = await db_get_obj("user", id, client);

  if (user_info == -1)
      return c.json({ message: 'User not found!'}, 404);
  user_info = user_info.serialize();
  return c.json({message: "user found", user: user_info}, 200);
});

app.delete('/api/user/:id', async (c) => {
  const id = await c.req.param('id');
  let user_info = await db_get_obj("user", id, client);

  if (user_info == -1)
    return c.json({ message: 'User not found!'}, 404);
  user_info = await db_delete_obj("user", id, client);
  if (user_info == -1)
    return c.json({ message: 'User deletion failed!'}, 500);
  return c.json({ message: 'User Deleted'}, 200);
});

Deno.serve(app.fetch);