import { User } from '../db_objects/user.ts';
import { Chats_Users } from '../db_objects/chats_users.ts';
import { Chat } from '../db_objects/chats.ts';
import { Message } from '../db_objects/messages.ts';
import { Notif } from '../db_objects/notif.ts';
import { Email_Verif } from '../db_objects/email_verif.ts';
import { Image } from '../db_objects/images.ts';
import { Friendly_Users } from '../db_objects/friendly_users.ts';
import { Loved_Users } from '../db_objects/loved_users.ts';
import { Seen_Users } from '../db_objects/seen_users.ts';

export async function init_db() {
	await User.init_table();
	await Chat.init_table();
	await Chats_Users.init_table();
	await Friendly_Users.init_table();
	await Loved_Users.init_table();
	await Seen_Users.init_table();
	await Message.init_table();
	await Notif.init_table();
	await Image.init_table();
	await Email_Verif.init_table();
}
