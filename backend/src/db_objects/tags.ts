import { client } from '../main.ts';

const TABLE = 'tags';

export class Tag {
	static async init_table() {
		await client.queryObject(`
			CREATE TABLE IF NOT EXISTS "${TABLE}" (
				name TEXT PRIMARY KEY
			);
		`);
	}

	static async create(tag_name: string) {
		await client.queryObject(
			`
				INSERT INTO "${TABLE}" (name)
				VALUES ($1);
			`,
			[tag_name]
		);
	}

	static async tag_exists(tag_name: string): Promise<boolean> {
		const res = await client.queryObject<{ name: string }>(
			`
				SELECT name FROM "${TABLE}"
				WHERE name = $1;
			`,
			[tag_name]
		);
		if (res.rows[0] == undefined) return false;
		return true;
	}

	static async get_all_tags(): Promise<string[]> {
		const res = await client.queryObject<{ name: string }>(
			`
				SELECT * FROM "${TABLE}";
			`
		);
		return res.rows.map((row) => row.name);
	}

	static async delete(name: string) {
		await client.queryObject(
			`
				DELETE FROM "${TABLE}" WHERE name = $1;
			`,
			[name]
		);
	}

	static name_is_valid(tag_name: string): boolean {
		const re_is_alpha = /^[A-Za-z_]+$/;
		if (!re_is_alpha.test(tag_name))
			return false;
		return true;
	}
}
