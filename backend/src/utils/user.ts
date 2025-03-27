import { compare } from "https://deno.land/x/bcrypt@v0.4.1/mod.ts";
import { User } from '../db_objects/user.ts';

export async function user_match(email: string, password: string): Promise<{ret_user?: User, err_password?: string, err_email?: string}> {
	const ret_user = await User.get_by_field("email", email);

	if (ret_user == null)
			return {err_email: "Wrong email"};
	const is_valid_pass = await compare(password, ret_user.password);
	if (ret_user.email == email && is_valid_pass)
		return {ret_user};
	else if (!is_valid_pass)
		return {err_password: "Wrong password"};
	return {err_email: "Wrong email", err_password: "Wrong password"};
}

export async function user_check(username: string, email: string, password: string): Promise<{error: boolean, err_password?:string, err_email?:string, err_username?:string}> {
	const [ is_valid_username, err_username ] = await check_username(username);
	const [ is_valid_email, err_email ] = await check_email(email);
	const [ is_valid_password, err_password ] = check_password(password, username);

	if (!is_valid_username || !is_valid_email || !is_valid_password)
		return {error: true, err_password, err_email, err_username}
	return {error: false}
}

async function check_username( username: string ): Promise<[boolean, string | undefined]> {
	const re = /^\w+$/;
	const re_is_apla = /^[A-Za-z]+$/;

	if(username.length < 3)
		return [ false, "Username is too short. It should be at least 3 characters long." ];
	if (username.length > 15 )
		return [ false, "Username is too long. It should be no more than 15 characters long." ];
	if (!re_is_apla.test(username[0]))
		return [ false, "Username should start with a letter." ];
	if (!re.test(username))
		return [ false, "Username should only contain letters, digits, and underscores (_)." ];
	const is_exists = await User.get_by_field("username", username);
	if (is_exists != null)
		return [ false, "Username already used."]
	return [ true, undefined ];
}

async function check_email( email: string ): Promise<[boolean, string | undefined]> {
	const re_email = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;    

	if (!re_email.test(email))
		return [ false, "Wrong email format" ];
	const is_exists = await User.get_by_field("email", email);
	if (is_exists != null)
		return [ false, "Email already used."]
	return [ true, undefined ];
}

function check_password( password: string, username: string ): [boolean, string | undefined] {
	const re_lower = /(?=.*?[a-z]).*/;
	const re_upper = /(?=.*?[A-Z]).*/;
	const re_digit = /\d/;
	const re_special_characters = /[!@#$%^&*(){}[\]<>?/|.:;_-]/;

	if(password.length < 10)
		return [ false, "Password is too short. It should be at least 10 characters long." ];
	if (password.length > 30 )
		return [ false, "Password is too long. It should be no more than 30 characters long." ];
	if (!re_lower.test(password))
		return [ false, "Password should contain at least one lowercase letter." ];
	if (!re_upper.test(password))
		return [ false,  "Password should contain at least one uppercase letter." ];
	if (!re_digit.test(password))
		return [ false, "Password should contain at least one digit." ];
	if (!re_special_characters.test(password))
		return [ false, "Password should contain at least one special character (e.g., !, @, #, $, etc.)." ];
	if (password.includes(username))
		return [ false, "Username is forbidden in password" ];
	return [ true, undefined ];
}