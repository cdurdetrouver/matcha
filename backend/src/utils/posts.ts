import { User } from '../db_objects/user.ts';

export async function get_list_users(user: User): Promise<User[]> {
	const list_user: User[] = [];
	let i = 1;

	while (list_user.length < 5 && i < 10) {
		const res: User[] = await user.get_posts_users_by_loc(10 * i);
		res.map((user: User) => {
			list_user.push(user);
		});
		i++;
	}
	return list_user;
}

function degreesToRadians(degrees: number): number {
	return (degrees * Math.PI) / 180;
}

function dist_EarthCoord(
	lat1: number,
	lon1: number,
	lat2: number,
	lon2: number
) {
	const earthRadiusKm = 6371;

	const dLat = degreesToRadians(lat2 - lat1);
	const dLon = degreesToRadians(lon2 - lon1);

	lat1 = degreesToRadians(lat1);
	lat2 = degreesToRadians(lat2);

	const a =
		Math.sin(dLat / 2) * Math.sin(dLat / 2) +
		Math.sin(dLon / 2) *
			Math.sin(dLon / 2) *
			Math.cos(lat1) *
			Math.cos(lat2);
	const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
	return earthRadiusKm * c;
}

const stopWords = new Set([
	'a',
	'an',
	'and',
	'the',
	'is',
	'in',
	'on',
	'at',
	'of',
	'to',
	'for',
	'with',
	'by',
	'from',
	'that',
	'this',
	'it',
	'as',
	'are',
	'was',
	'were',
	'be',
	'been',
	'but',
	'or',
	'not',
	'so',
]);

function getImportantWords(text: string): Set<string> {
	return new Set(
		text
			.toLowerCase()
			.match(/\b\w+\b/g) // match only words
			?.filter((word) => !stopWords.has(word)) || []
	);
}

function count_keyword(str1: string, str2: string): number {
	const words1 = getImportantWords(str1);
	const words2 = getImportantWords(str2);

	let count = 0;
	for (const word of words1) {
		if (words2.has(word)) {
			count++;
		}
	}
	return count;
}

export function grad_users(users_list: User[], user: User): [User, number][] {
	const list_mark: [User, number][] = [];
	for (let i = 0; i < users_list.length; i++) {
		let note = 0;
		note +=
			dist_EarthCoord(
				user.lat,
				user.long,
				users_list[i].lat,
				users_list[i].long
			) % 100;
		for (let j = 0; j < users_list.length; j++) {
			if (
				user.interests?.[j] &&
				users_list[i].interests?.includes(user.interests[j])
			) {
				note += 5;
			}
		}
		if (users_list[i].wanted == user.wanted) note += 25;
		note +=
			count_keyword(
				user.description ?? '',
				users_list[i].description ?? ''
			) * 5;
		list_mark.push([users_list[i], note]);
	}
	list_mark.sort((a, b) => b[1] - a[1]);
	return list_mark;
}
