import { Hono } from 'hono'
import { jwt, sign, verify } from 'hono/jwt'
import { user } from '../types/user.ts';
import { jwtSecret, client } from '../main.ts';
import { db_get_user } from '../utils/db_actions.ts';
import { getCookie, setCookie, deleteCookie} from 'hono/cookie';
import { cryptoRandomStringAsync } from 'crypto-random-string';
import type { JwtVariables } from 'hono/jwt';

export async function check_cookies(c, id: string) {
		const acces_token = await getCookie(c).acces_token;

		if (!id)
			return {cookies: "No id provided.", ret_val: 401, user: null};
		if (!acces_token)
			return {cookies: "No acces token provided", ret_val: 401, user: null};;
		const { message, id_ret, token_type } = await verify_token(acces_token);
		if (token_type != "acces")
			return {cookies: "Wrong token type provided", ret_val: 401, user: null};
		if (message)
			return {cookies: message, ret_val: 401, user: null};
		let user_info = await db_get_user(id);
		if (user_info == -1)
			return {cookies: "User not found !", ret_val: 404, user: null};
		if (user_info.id != id_ret)
			return {cookies: "Trying to fetch unauthorized data !", ret_val: 401, user: null};
		return {"cookies": 1, "ret_val": null, "user_info": user_info};
}

function get_payload(id: number, username: string, time: number, type: string) {
	return ({"id": `${id}`, 
			"username": `${username}`,
			"type": `${type}`,
			"exp": `${Math.floor(Date.now() / 1000) + (60 * time)}`,
			"nbf": `${Math.floor(Date.now() / 1000)}`
		});
}

export async function get_date_token() {
	let timestamp = new Date();
	timestamp.setDate(timestamp.getDate() + 7);
	return timestamp.toISOString();
}

export async function get_refresh_token(user: user) {
	const token = await sign(get_payload(user.id, user.username, 10080, "refresh"), jwtSecret);
	return token;
}

export async function get_access_token(user: user) {
	const token = await sign(get_payload(user.id, user.username, 5, "acces"), jwtSecret);
	return token;
}

export async function verify_token(token: string) {
	try {
		const payload = await verify(token, jwtSecret);
		return {"message": null, id_ret: payload["id"], token_type: payload["type"]};
	}
	catch (error) {
		return { "message": error.name};
	}
	return 0;
	  
}