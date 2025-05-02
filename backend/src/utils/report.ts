import { Ban_Users } from "../db_objects/ban_users.ts";
import { Report_Users } from "../db_objects/report_users.ts";
import { Seen_Users } from "../db_objects/seen_users.ts";
import { User } from "../db_objects/user.ts";
import { sendDeleteAccountEmail } from "./send_mail.ts";

export const Reasonlist = [
	'Inappropriate content',
	'Spam',
	'fake account'];

export async function report_user(user: User, target_user: User, reason: string) {
	await Report_Users.add_report(user.id, target_user.id, reason);
	const reports = await Report_Users.get_reports_by_target(
		target_user.id, reason);
	if (reports.length >= 3) {
		const seen_user = await Seen_Users.get_who_seen(target_user.id);
		if (seen_user.length >= 30) {
			let i = 0;
			reports.every(report => {
				i++;
				return seen_user.some(
				user => user.id === report.id)})
			if (i >= 3) {
				await sendDeleteAccountEmail(target_user.email, reason);
				await Ban_Users.add_ban(target_user.email);
				await User.delete(target_user.id);
			}
		}
	}
}
