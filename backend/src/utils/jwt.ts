import { Hono } from 'hono'
import { jwt, sign, verify } from 'hono/jwt'
import { user } from '../types/user.ts';
import { jwtSecret, client } from '../main.ts';
import { db_get_obj } from '../utils/db_actions.ts';
import { getCookie, setCookie, deleteCookie} from 'hono/cookie';
import { cryptoRandomStringAsync } from 'crypto-random-string';
import type { JwtVariables } from 'hono/jwt';

export async function check_cookies(c) {
		const acces_token = await getCookie(c).acces_token;
		
		if (!acces_token)
			return "No acces token.";
		const ret = await verify_token(acces_token);
		if (ret != 1)
			return ret.name;
		return 1;
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
	const token = await cryptoRandomStringAsync({length: 200, type: 'base64'});
	return token;
}

export async function get_access_token(user: user) {
	const token = await sign(get_payload(user.id, user.username, 5, "acces"), jwtSecret);
	return token;
}

export async function verify_token(token: string) {
	try {
		const payload = await verify(token, jwtSecret);
		if (payload["type"] == "acces")
			return 1;
		return 0;
	}
		catch (error) {
		return error;
	}
	return 0;
	  
}