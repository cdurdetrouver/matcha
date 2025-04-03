import { client } from '../main.ts';

const TABLE = 'images_users';

export class Images_Users {
	static async init_table() {
		await client.queryObject(`
			CREATE TABLE IF NOT EXISTS "${TABLE}" (
    		id SERIAL PRIMARY KEY,
			user_id INT REFERENCES Users(id) ON DELETE CASCADE,
			image_name VARCHAR(255)
			);
		`);
	}

	static async post_image_user(user_id: number, image_name: string) {
		const res = await client.queryObject<{ id: number}>(
			`
				INSERT INTO "${TABLE}" (user_id, image_name)
				VALUES ($1, $2) RETURN id;
			`,
			[user_id, image_name]
		);
		return res.rows[0].id;
	}

	static async get_images_by_user(user_id: number): Promise<string[]> {
		const res = await client.queryObject<string>(
			`
				SELECT * FROM "${TABLE}"
				WHERE user_id = $1;
			`,
			[user_id]
		);
		return res.rows.map((row) => row);
	}

	static async delete_image_by_id(image_id: number) {
		await client.queryObject(
			`
				DELETE FROM "${TABLE}"
				WHERE id = $1 ;
			`,
			[image_id]
		);
	}
}