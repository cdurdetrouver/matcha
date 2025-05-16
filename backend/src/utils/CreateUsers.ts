import { User } from '../db_objects/user.ts';
import { client } from '../main.ts';
import { faker } from 'npm:@faker-js/faker';
import randomFloat from 'npm:random-float';

export async function populateUsers() {
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
			lat: faker.location.latitude(48.8566, 51.1248),
			long: faker.location.longitude(-5.1432, 9.5598),
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
			await newUser.save();
		} catch (error) {
			console.error('Error creating user:', error);
		}
	}

	console.log('Users created');
}
