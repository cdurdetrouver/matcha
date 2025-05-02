import { User } from '../db_objects/user.ts';
import { Chats_Users } from '../db_objects/chats_users.ts';
import { Chat } from '../db_objects/chats.ts';
import { Message } from '../db_objects/messages.ts';
import { Notif } from '../db_objects/notif.ts';
import { Email_Verif } from '../db_objects/email_verif.ts';
import { Image } from '../db_objects/images.ts';
import { Seen_Users } from '../db_objects/seen_users.ts';
import { Tag } from "../db_objects/tags.ts";
import { Tags_Users } from "../db_objects/tags_users.ts";
import { Relations_Users } from "../db_objects/relations_users.ts";
import { Report_Users } from "../db_objects/report_users.ts";
import { Ban_Users } from "../db_objects/ban_users.ts";

export async function init_db() {
	await User.init_table();
	await Chat.init_table();
	await Tag.init_table();
	await Tags_Users.init_table();
	await Chats_Users.init_table();
	await Relations_Users.init_table();
	await Ban_Users.init_table();
	await Seen_Users.init_table();
	await Report_Users.init_table();
	await Message.init_table();
	await Notif.init_table();
	await Image.init_table();
	await Email_Verif.init_table();
}
