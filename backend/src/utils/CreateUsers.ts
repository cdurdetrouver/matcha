import { User } from '../db_objects/user.ts';
import { Image } from '../db_objects/images.ts';
import { faker } from 'npm:@faker-js/faker';
import randomFloat from 'npm:random-float';
import { Tag } from '../db_objects/tags.ts';
import { Tags_Users } from '../db_objects/tags_users.js';

const tags = [
	'basketball',
	'football',
	'tennis',
	'video games',
	'reading',
	'cooking',
	'traveling',
	'photography',
	'fitness',
	'music',
	'art',
	'technology',
	'fashion',
	'food',
	'movies',
	'comedy',
	'gaming',
	'outdoors',
	'crafting',
	'writing',
	'animals',
	'health',
	'education',
	'home improvement',
	'gardening',
	'parenting',
	'personal finance',
	'self-improvement',
	'language learning',
	'home decor',
	'collecting',
	'volunteering',
	'podcasting',
	'blogging',
	'cooking',
	'knitting',
	'woodworking',
	'painting',
	'drawing',
	'calligraphy',
	'jewelry making',
	'model building',
	'stargazing',
	'board games',
	'card games',
	'role-playing games',
	'virtual reality',
	'augmented reality',
	'3D printing',
	'cryptocurrency',
	'blockchain',
	'AI and machine learning',
	'cybersecurity',
	'data science',
	'web development',
	'mobile app development',
	'graphic design',
	'video editing',
	'photography editing',
	'animation',
	'illustration',
	'UX/UI design',
	'virtual events',
	'remote work',
	'freelancing',
	'consulting',
	'coaching',
	'mentoring',
];

function getRandomTags(): string[] {
	const tagsCopy = [...tags];
	const count = Math.floor(Math.random() * tagsCopy.length) + 1;
	const selected: string[] = [];
	for (let i = 0; i < count; i++) {
		const idx = Math.floor(Math.random() * tagsCopy.length);
		selected.push(tagsCopy.splice(idx, 1)[0]);
	}
	return selected;
}

export async function populateTags() {
	if ((await Tag.get_all_tags()).length >= tags.length) {
		console.log('Tags already populated');
		return;
	}

	for (const tag of tags) {
		try {
			await Tag.create(tag);
		} catch (error) {
			console.error('Error creating tag:', tag);
		}
	}

	console.log('Tags created');
}

export async function populateUsers() {
	if ((await User.getall()).length >= 500) {
		console.log('Users already populated');
		return;
	}
	const users: Partial<User>[] = [];
	for (let i = 0; i < 500; i++) {
		const user: Partial<User> = {
			username: faker.internet.username(),
			password: faker.internet.password(),
			email: faker.internet.email(),
			online: faker.datatype.boolean(),
			complete_profile: true,
			email_verif: true,
			gender: faker.helpers.arrayElement(['male', 'female']),
			sexual_preferences: faker.helpers.arrayElement([
				'male',
				'female',
				'both',
			]),
			description: faker.lorem.sentence(),
			lat: faker.location.latitude(48.8, 49.1),
			long: faker.location.longitude(1.8, 3.5),
			auth_provider: 'email',
			birthdate: faker.date
				.past(30, new Date())
				.toISOString()
				.split('T')[0],
			mbti: faker.helpers.arrayElement(['INTJ', 'INFP', 'ENTP', 'ESFJ']),
			fame_rate: randomFloat(1),
			insta_link: faker.internet.url(),
			x_link: faker.internet.url(),
			intra_link: faker.internet.url(),
		};
		users.push(user);
	}

	for (const user of users) {
		try {
			const newUser = new User(user);
			await newUser.create();
			await newUser.save(false);
			const randomNumber: number = Math.floor(Math.random() * 2);
			const name = 'avatar_' + randomNumber + '_default';
			await Image.post(newUser.id, name, 'avatar');
			const user_tags = getRandomTags();
			await Tags_Users.add_tags(newUser.id, user_tags);
		} catch (error) {
			console.error('Error creating user:', error);
		}
	}

	await User.update_all();

	console.log('Population created');
}
