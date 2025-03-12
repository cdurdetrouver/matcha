import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { db_connect, db_init } from './utils/db_actions.ts';
import user from './routes/user.ts';
//import { user } from './types/user.ts';
import { jwt } from 'hono/jwt'
import 'https://deno.land/x/dotenv/load.ts';
import type { JwtVariables } from 'hono/jwt'
import { get_access_token, get_refresh_token, verify_token } from './utils/jwt.ts';

type Variables = JwtVariables

export const jwtSecret = ('JWT_SECRET'); 

const app = new Hono<{ Variables: Variables }>();

app.route('/api/user', user);

//const authMiddleware: MiddlewareHandler = async (c, next) => {
//    const token = getCookie(c, 'token');
//    if (token) {
//        const isAuthenticated = await verify_token(token);
//        if (isAuthenticated) {
//            await next();
//        } else {
//            return c.redirect('/login');
//        }
//    } else {
//        return c.redirect('/login');
//    }
//};

//const user_test = new user("test", "test", "dsjf@gmail.com", 1, new Date());
//const token = await get_access_token(user_test);
//console.log("token: ", token);
//console.log("verify: ", await verify_token(token));
//console.log("verify: ", await verify_token("slfshjadlgdklfgjlas"));

export const client = await db_connect();

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

//login    -|
//register  - > refresh token + acces token

//refreresh token ->
//export client;

Deno.serve(app.fetch);