import { compare } from "https://deno.land/x/bcrypt/mod.ts";
import { db_get_user_custom, db_get_obj_custom } from '../utils/db_actions.ts';

export async function user_match(email: string, password: string) {
	const ret_user = await db_get_user_custom("email", email);

	if (ret_user == -1 || ret_user.length == 0)
			return { user_found:-1 };
	const is_valid_pass = await compare(password, ret_user.password);
	console.log(is_valid_pass, password, ret_user.password);
	if (ret_user.email == email && is_valid_pass)
		return { user_found:0, ret_user:ret_user };
	else
		return { user_found:1 };
}

export async function user_check(username: string, email: string, password: string) {
	const [ is_valid_username, err_username ] = await check_username(username);
	const [ is_valid_email, err_email ] = await check_email(email);
	const [ is_valid_password, err_password ] = await check_password(password, username);

	if (!is_valid_username)
		return [ 0, err_username ];
	else if (!is_valid_email)
		return [ 0, err_email ];
	else if (!is_valid_password)
		return [ 0, err_password ];
	return [ 1, undefined ];
}

async function check_username( username: string ) {
	var re = /^\w+$/;
	var re_is_apla = /^[A-Za-z]+$/;

	if(username.length < 3)
		return [ 0, "Username is too short. It should be at least 3 characters long." ];
	if (username.length > 15 )
		return [ 0, "Username is too long. It should be no more than 15 characters long." ];
	if (!re_is_apla.test(username[0]))
		return [ 0, "Username should start with a letter." ];
	if (!re.test(username))
		return [ 0, "Username should only contain letters, digits, and underscores (_)." ];
	const is_exists = (await db_get_obj_custom("user", "username", username))['rows'].length;
	if (is_exists != 0)
		return [ 0, "Username already used."]
	return [ 1, undefined ];
}

async function check_email( email: string ) {
	var re_email = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;    

	if (!re_email.test(email))
		return [ 0, "Wrong email format" ];
	const is_exists = (await db_get_obj_custom("user", "email", email))['rows'].length;
	if (is_exists != 0)
		return [ 0, "Email already used."]
	return [ 1, undefined ];
}

async function check_password( password: string, username: string ) {
	var re_lower = /(?=.*?[a-z]).*/;
	var re_upper = /(?=.*?[A-Z]).*/;
	var re_digit = /\d/;
	var re_special_characters = /[!@#$%^&*(){}[\]<>?/|.:;_-]/;

	if(password.length < 10)
		return [ 0, "Password is too short. It should be at least 10 characters long." ];
	if (password.length > 30 )
		return [ 0, "Password is too long. It should be no more than 30 characters long." ];
	if (!re_lower.test(password))
		return [ 0, "Password should contain at least one lowercase letter." ];
	if (!re_upper.test(password))
		return [ 0,  "Password should contain at least one uppercase letter." ];
	if (!re_digit.test(password))
		return [ 0, "Password should contain at least one digit." ];
	if (!re_special_characters.test(password))
		return [ 0, "Password should contain at least one special character (e.g., !, @, #, $, etc.)." ];
	if (password.includes(username))
		return [ 0, "Username is forbidden in password" ];
	return [ 1, undefined ];
}