import { Hono, type Context } from "hono";
//import { user_match, user_check } from '../utils/user.ts';
//import User from '../types/user.ts';
//import { getCookie, deleteCookie} from 'hono/cookie';
//import { get_access_token, get_refresh_token, verify_token, check_cookies } from '../utils/jwt.ts';
//import { db_post_obj, db_delete_obj, db_put_obj } from '../utils/db_actions.ts';
//import { db_get_user, db_get_user_custom } from '../utils/db_user.ts';

const app = new Hono()

//app.get('/ws', (c: Context) => {
//	console.log('coucou')
//	const { response, socket } = Deno.upgradeWebSocket(c.req as unknown as Request);
//	socket.onmessage = (event) => {
//		console.log(event.data);
//	};
//	socket.onclose = () => {
//		console.log('WebSocket closed');
//	};
//	return response;
//});

app.get("/ws", (c) => {
	const { response, socket } = Deno.upgradeWebSocket(c.req.raw);
  
	socket.onopen = () => {
	  console.log("WebSocket connection opened");
	  socket.send("Welcome to Hono WebSocket!");
	};
  
	socket.onmessage = (event) => {
	  console.log("Received:", event.data);
	  socket.send(`Server received: ${event.data}`);
	};
  
	socket.onclose = () => {
	  console.log("WebSocket connection closed");
	};
  
	socket.onerror = (error) => {
	  console.error("WebSocket error:", error);
	};
  
	return response;
  });
  

app.notFound((c:Context) => {
	return c.json({ message: 'Route not Found' }, 404)
});

export default app
