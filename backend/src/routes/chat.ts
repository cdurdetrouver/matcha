import { Hono, type Context } from "hono";
import { user_match, user_check } from '../utils/user.ts';
import User from '../types/user.ts';
import { getCookie, deleteCookie} from 'hono/cookie';
import { get_access_token, get_refresh_token, verify_token, check_cookies } from '../utils/jwt.ts';
import { db_post_obj, db_delete_obj, db_put_obj } from '../utils/db_actions.ts';
import { db_get_user, db_get_user_custom } from '../utils/db_user.ts';

const app = new Hono()



app.notFound((c:Context) => {
	return c.json({ message: 'Route not Found' }, 404)
});


export default app