import { client } from '../main.ts';
import { RelationType } from '../types/relation.ts';
import { User } from './user.ts';

const TABLE = 'relations_users';

export class Relations_Users {
	target_id: number;
	user_id: number;
	relation: number;
	time_to_match: number = 0;

	constructor(
		target_idOrOther: number | Partial<Relations_Users>,
		user_id?: number,
		relation?: number,
		time_to_match?: number
	) {
		if (typeof target_idOrOther === 'object' && target_idOrOther !== null) {
			this.target_id = target_idOrOther.target_id!;
			this.user_id = target_idOrOther.user_id!;
			this.relation = target_idOrOther.relation!;
			this.time_to_match = target_idOrOther.time_to_match!;
		} else {
			this.target_id = target_idOrOther;
			this.user_id = user_id!;
			this.relation = relation!;
			this.time_to_match = time_to_match!;
		}
	}

	static async init_table() {
		await client.queryObject(`
            CREATE TABLE IF NOT EXISTS "${TABLE}" (
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                target_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                relation INTEGER DEFAULT 0,
                time_to_match BIGINT DEFAULT 0, -- Add time_to_match column
                PRIMARY KEY (user_id, target_id)
            );
        `);
	}

	static async add_relation(
		user_id: number,
		target_id: number,
		relation: number,
		time_to_match: number = 0
	) {
		await client.queryObject(
			`
                INSERT INTO "${TABLE}" (user_id, target_id, relation, time_to_match)
                VALUES ($1, $2, $3, $4)
                ON CONFLICT (user_id, target_id)
                DO UPDATE SET relation = $3, time_to_match = $4;
            `,
			[user_id, target_id, relation, time_to_match]
		);
	}

	static async get_relations(user_id: number): Promise<Relations_Users[]> {
		const res = await client.queryObject<{
			target_id: number;
			user_id: number;
			relation: number;
			time_to_match: number;
		}>(
			`
                SELECT target_id, user_id, relation, time_to_match FROM "${TABLE}"
                WHERE user_id = $1;
            `,
			[user_id]
		);
		return res.rows.map((row) => new Relations_Users(row));
	}

	static async get_relation(
		user_id: number,
		target_id: number
	): Promise<Relations_Users> {
		const res = await client.queryObject<{
			target_id: number;
			user_id: number;
			relation: number;
			time_to_match: number;
		}>(
			`
                SELECT target_id, user_id, relation, time_to_match FROM "${TABLE}"
                WHERE user_id = $1 AND target_id = $2;
            `,
			[user_id, target_id]
		);
		if (res.rows[0] == undefined) throw new Error('Relation not found');
		return new Relations_Users(res.rows[0]);
	}

	static async is_related(
		user_id: number,
		target_id: number
	): Promise<number> {
		const res = await client.queryObject<{
			target_id: number;
			user_id: number;
			relation: number;
		}>(
			`
                SELECT target_id, user_id, relation FROM "${TABLE}"
                WHERE user_id = $1 AND target_id = $2;
            `,
			[user_id, target_id]
		);
		if (res.rows[0] == undefined) return -1;
		return res.rows[0].relation;
	}

	static async delete_relation(
		user_id: number,
		target_id: number
	): Promise<void> {
		await client.queryObject(
			`
				DELETE FROM "${TABLE}"
				WHERE user_id = $1 AND target_id = $2 OR user_id = $2 AND target_id = $1;
			`,
			[user_id, target_id]
		);
	}

	async serialize(): Promise<RelationType> {
		const user = await (await User.get_by_id(this.target_id)).serialize();
		const relation_s: RelationType = {
			user_target: user,
			relation: this.relation,
			time_to_match: Number(this.time_to_match),
		};
		return relation_s;
	}
}
