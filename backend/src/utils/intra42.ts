import { User } from '../db_objects/user.ts';
import { UserTypeIntra } from '../types/user.ts';
import {
	INTRA_API_KEY,
	INTRA_API_SECRET,
	INTRA_API_REDIRECT_URL,
} from '../secret.ts';
import { post_file_from_url } from './google_file.ts';
import { generate_username } from './user.ts';

async function get_access_token(code: string) {
	const data = {
		grant_type: 'authorization_code',
		client_id: INTRA_API_KEY,
		client_secret: INTRA_API_SECRET,
		code: code,
		redirect_uri: INTRA_API_REDIRECT_URL,
	};
	const res = await fetch('https://api.intra.42.fr/oauth/token', {
		method: 'POST',
		body: new URLSearchParams(data),
	});
	if (res.status !== 200) {
		throw new Error('Error fetching access token from 42 API');
	}
	const data_res = await res.json();
	const token = data_res.access_token;
	return token;
}

export async function get_userIntra_by_code(code: string): Promise<User> {
	const access_token = await get_access_token(code);
	const res = await fetch(
		`https://api.intra.42.fr/v2/me?access_token=${access_token}`,
		{
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
			},
		}
	);
	if (res.status !== 200) {
		throw new Error('Error fetching user data from 42 API');
	}
	const data = await res.json();
	const user_intra: UserTypeIntra = data;

	try {
		const user = (await User.get_by_field('email', user_intra.email))[0];
		if (user.auth_provider !== 'intra') {
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
		const username = await generate_username(user_intra.login);

		const user = new User({
			username: username,
			email: user_intra.email,
			password: '',
			auth_provider: 'intra',
			email_verif: true,
		});
		await user.create();
		await user.save();
		try {
			await post_file_from_url(
				user.username + '_avatar',
				user_intra.image.link,
				user.id
			);
		} catch (err) {
			console.log('Error posting file from url', err);
		}
		return user;
	}
}
