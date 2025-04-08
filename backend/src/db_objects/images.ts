import { client } from '../main.ts';
import { ImageType } from "../types/image.ts";
import { get_signed_url } from "../utils/google_file.ts";

const TABLE = 'Image';

export class Image {
	filename: string;
	id: number = 0;
	user_id: number = 0;
	type?: string ;

	constructor(linkOrOther: string | Partial<Image>, filename?: string, id?: number) {
		if (typeof linkOrOther === 'object' && linkOrOther !== null) {
			this.id = linkOrOther.id ?? 0;
			this.filename = linkOrOther.filename!;
			this.user_id = linkOrOther.user_id!;
			this.type = linkOrOther.type!;
		}
		else {
			this.user_id = id!;
			this.filename = filename!;
			this.id = id!;
		}
	}

	static async init_table() {
		await client.queryObject(`
			CREATE TABLE IF NOT EXISTS "${TABLE}" (
    		id SERIAL PRIMARY KEY,
			user_id INT REFERENCES Users(id) ON DELETE CASCADE,
			filename VARCHAR(255) UNIQUE,
			type VARCHAR(255)
			);
		`);
	}

	static async post(user_id: number, filename: string, type: string): Promise<Image> {
		const res = await client.queryObject<{ id: number }>(
			`
				INSERT INTO "${TABLE}" (user_id, filename, type)
				VALUES ($1, $2, $3) RETURNING id;
			`,
			[user_id, filename, type]
		);
		const id = res.rows[0].id;
		return new Image({ id, filename, user_id, type });
	}

	static async get_post_by_user(user_id: number): Promise<Image[]> {
		const res = await client.queryObject<string>(
			`
				SELECT * FROM "${TABLE}"
				WHERE user_id = $1 AND type = 'post';
			`,
			[user_id]
		);
		return res.rows.map((row) => new Image(row));
	}

	static async get_avatar_by_user(user_id: number): Promise<Image> {
		const res = await client.queryObject<string>(
			`
				SELECT * FROM "${TABLE}"
				WHERE user_id = $1;
			`,
			[user_id]
		);
		const user = res.rows[0];
		if (user == undefined) throw Error('Avatar not found');
		return new Image(user);
	}

	static async get_by_id(id: number): Promise<Image> {
		const res = await client.queryObject<string>(
			`
				SELECT * FROM "${TABLE}"
				WHERE id = $1;
			`,
			[id]
		);
		const user = res.rows[0];
		if (user == undefined) throw Error();
		return new Image(user);
	}

	static async delete_by_id(image_id: number) {
		console.log('image_id', image_id);
		await client.queryObject(
			`
				DELETE FROM "${TABLE}"
				WHERE id = $1;
			`,
			[image_id]
		);
	}

	async serialize(): Promise<ImageType> {
		const link = await get_signed_url(this.filename, 86400);
		return {
			link: link,
			filename: this.filename,
			user_id: this.user_id,
			id: this.id,
		};
	}
}
