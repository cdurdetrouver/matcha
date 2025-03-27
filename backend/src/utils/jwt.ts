import { sign, verify } from 'hono/jwt'
import { User } from '../types/user.ts';
import { JWT_SECRET } from '../secret.ts';
import { db_get_user } from '../utils/db_user.ts';
import { getCookie } from 'hono/cookie';
import { type Context } from "hono";
import { JWTPayload } from "hono/utils/jwt/types";
import { ContentfulStatusCode } from "hono/utils/http-status";


export async function check_cookies(c: Context, id: number, id_nonblock?: boolean): Promise<{cookies: string | boolean, ret_val: ContentfulStatusCode | undefined, user: User | null}> {
		const access_token = await getCookie(c).access_token;

		if (id == undefined)
			return {cookies: "No id provided.", ret_val: 401, user: null};
		if (!access_token)
			return {cookies: "No acces token provided", ret_val: 401, user: null};
		const tokenResult = await verify_token(access_token);
		if (!tokenResult )
			return {cookies: "Acces token provided not valid", ret_val: 401, user: null};
		const {message, id_ret, token_type} = tokenResult;
		if (message)
			return {cookies: message, ret_val: 401, user: null};
		if (token_type != "acces")
			return {cookies: "Wrong token type provided", ret_val: 401, user: null};
		const user_info = await db_get_user(id);
		if (user_info == null)
			return {cookies: "User not found !", ret_val: 404, user: null};
		if (!id_nonblock && user_info.id != id_ret)
			return {cookies: "Trying to acces to unauthorized data !", ret_val: 401, user: null};
		return {cookies: true, ret_val: undefined, user: user_info};
}

function get_payload(id: number, username: string, time: number, type: string): JWTPayload {
	return ({"id": `${id}`, 
			"username": `${username}`,
			"type": `${type}`,
			"exp": Math.floor(Date.now() / 1000) + (60 * time),
			"nbf": Math.floor(Date.now() / 1000)
		});
}

export function get_date_token() {
	const timestamp = new Date();
	timestamp.setDate(timestamp.getDate() + 7);
	return timestamp.toISOString();
}

export async function get_refresh_token(user: User) {
	const token = await sign(get_payload(user.id, user.username, 10080, "refresh"), JWT_SECRET);
	return token;
}

export async function get_access_token(user: User) {
	const token = await sign(get_payload(user.id, user.username, 5, "acces"), JWT_SECRET);
	return token;
}

export async function verify_token(token: string): Promise<{message ?: string , id_ret	?: number, token_type ?: string} | null> {
	try {
		const payload = await verify(token, JWT_SECRET);
		return {id_ret: Number(payload.id), token_type: String(payload.type)};
	}
	catch (error: unknown) {
		if (error instanceof Error) {
			return { message: error.name };
		}
		return null;
	}
}
