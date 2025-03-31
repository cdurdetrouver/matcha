import { sign, verify } from 'hono/jwt';
import { User } from '../db_objects/user.ts';
import { JWT_SECRET } from '../secret.ts';
import { getCookie } from 'hono/cookie';
import { type Context } from 'hono';
import { JWTPayload } from 'hono/utils/jwt/types';
import { ContentfulStatusCode } from 'hono/utils/http-status';

export async function check_cookies(c: Context): Promise<{
	message?: string;
	ret_val?: ContentfulStatusCode;
	user: User | null;
}> {
	const access_token = getCookie(c).access_token;
	console.log(access_token);

	if (!access_token)
		return { message: 'No acces token provided', ret_val: 401, user: null };
	const tokenResult = await verify_token(access_token);
	if (!tokenResult)
		return {
			message: 'Acces token provided not valid',
			ret_val: 401,
			user: null,
		};
	const { message, id_ret, token_type } = tokenResult;
	if (message) return { message: message, ret_val: 401, user: null };
	if (token_type != 'acces')
		return {
			message: 'Wrong token type provided',
			ret_val: 401,
			user: null,
		};
	try {
		console.log(id_ret);
		const user_info = await User.get_by_id(Number(id_ret));
		return { user: user_info };
	} catch (_error) {
		return { message: 'User not found !', ret_val: 404, user: null };
	}
}

function get_payload(
	id: number,
	username: string,
	time: number,
	type: string
): JWTPayload {
	return {
		id: `${id}`,
		username: `${username}`,
		type: `${type}`,
		exp: Math.floor(Date.now() / 1000) + 60 * time,
		nbf: Math.floor(Date.now() / 1000),
	};
}

export function get_date_token() {
	const timestamp = new Date();
	timestamp.setDate(timestamp.getDate() + 7);
	return timestamp.toISOString();
}

export async function get_refresh_token(user: User) {
	const token = await sign(
		get_payload(user.id, user.username, 10080, 'refresh'),
		JWT_SECRET
	);
	return token;
}

export async function get_access_token(user: User) {
	const token = await sign(
		get_payload(user.id, user.username, 5, 'acces'),
		JWT_SECRET
	);
	return token;
}

export async function verify_token(
	token: string
): Promise<{ message?: string; id_ret?: number; token_type?: string } | null> {
	try {
		const payload = await verify(token, JWT_SECRET);
		return { id_ret: Number(payload.id), token_type: String(payload.type) };
	} catch (error: unknown) {
		if (error instanceof Error) {
			return { message: error.name };
		}
		return null;
	}
}
