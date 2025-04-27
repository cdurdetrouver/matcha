import { User } from '../db_objects/user.ts';
import { UserTypeGoogle } from '../types/user.ts';
import { GOOGLE_ID, GOOGLE_SECRET, GOOGLE_REDIRECT_URI } from '../secret.ts';
import { post_file_from_url } from './google_file.ts';
import { generate_username } from './user.ts';

async function get_access_token(code: string) {
	const data = {
		grant_type: 'authorization_code',
		client_id: GOOGLE_ID,
		client_secret: GOOGLE_SECRET,
		code: code,
		redirect_uri: GOOGLE_REDIRECT_URI,
	};
	const res = await fetch('https://oauth2.googleapis.com/token', {
		method: 'POST',
		body: new URLSearchParams(data),
	});
	if (res.status !== 200) {
		throw new Error('Error fetching access token from Google API');
	}
	const data_res = await res.json();
	const token = data_res.access_token;
	return token;
}

export async function get_userGoogle_by_code(code: string): Promise<User> {
	const access_token = await get_access_token(code);
	const res = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${access_token}`,
		},
	});
	if (res.status !== 200) {
		throw new Error('Error fetching user data from Google API');
	}
	const data = await res.json();
	const user_google: UserTypeGoogle = data;

	try {
		const user = (await User.get_by_field('email', user_google.email))[0];
		if (user.auth_provider !== 'google') {
			throw new Error(
				'User already exists with a different auth provider'
			);
		}
		return user;
	} catch (err) {
		if (
			err instanceof Error &&
			err.message === 'User already exists with a different auth provider'
		) {
			throw new Error(
				'User already exists with a different auth provider'
			);
		}
		const username = await generate_username(user_google.name);

		const user = new User({
			username: username,
			email: user_google.email,
			password: '',
			auth_provider: 'google',
			email_verif: user_google.verified_email,
		});
		await user.create();
		await user.save();
		try {
			await post_file_from_url(
				user.username + '_avatar',
				user_google.picture,
				user.id
			);
		} catch (err) {
			console.log('Error posting file from url', err);
		}
		return user;
	}
}
