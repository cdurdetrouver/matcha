import { client } from '../main.ts';
import { RelationType } from '../types/relation.ts';
import { User } from "./user.ts";

const TABLE = 'relations_users';

export class Relations_Users {
	target_id: number;
	user_id: number;
	relations: number;
	constructor(
		target_idOrOther: number | Partial<Relations_Users>,
		user_id?: number,
		relations?: number
	) {
		if (typeof target_idOrOther === 'object' && target_idOrOther !== null) {
			this.target_id = target_idOrOther.target_id!;
			this.user_id = target_idOrOther.user_id!;
			this.relations = target_idOrOther.relations!;
		} else {
			this.target_id = target_idOrOther;
			this.user_id = user_id!;
			this.relations = relations!;
		}
	}

	static async init_table() {
		await client.queryObject(`
			CREATE TABLE IF NOT EXISTS "${TABLE}" (
				user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
				target_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
				PRIMARY KEY (user_id, target_id),
				relation INTEGER DEFAULT 0
			);
		`);
	}

	static async add_relation(user_id: number, target_id: number, relation: number) {
		await client.queryObject(
			`
				INSERT INTO "${TABLE}" (user_id, target_id, relation)
				VALUES ($1, $2, $3);
			`,
			[user_id, target_id, relation]
		);
	}

	static async remove_relation(user_id: number, target_id: number) {
		await client.queryObject(
			`
				DELETE FROM "${TABLE}"
				WHERE user_id = $1 AND target_id = $2;
			`,
			[user_id, target_id]
		);
	}

	static async get_relations(user_id: number): Promise<Relations_Users[]> {
		const res = await client.queryObject<{
			target_id: number;
			user_id: number;
			relations: number;
		}>(
			`
				SELECT target_id, user_id, relation FROM "${TABLE}"
				WHERE user_id = $1;
			`,
			[user_id]
		);
		return res.rows.map(row => new Relations_Users(row));
	}

	static async is_related(user_id: number, target_id: number): Promise<boolean> {
		const res = await client.queryObject<{
			target_id: number;
			user_id: number;
			relations: number;
		}>(
			`
				SELECT target_id, user_id, relation FROM "${TABLE}"
				WHERE user_id = $1 AND target_id = $2;
			`,
			[user_id, target_id]
		);
		if (res.rows[0] == undefined) return false;
		return true;
	}

	async serialize(): Promise<RelationType> {
		const user = await (await User.get_by_id(this.target_id)).serialize(); 
		const relation_s: RelationType = {
			user_target: user,
			relation: this.relations,
		};
		return relation_s;
	}
}
