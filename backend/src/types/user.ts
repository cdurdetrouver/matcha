export type UserType = {
	username: string;
	id: number;
	email?: string;
	created_at: number;
	avatar: string;
}

export class User {
	username: string;
	password: string;
	email: string;
	photo_id: string;
	online: boolean;
	chat_ids: number[];
	id: number;
	created_at: number;

	[key: string]: unknown;
	constructor(...args: unknown[]) {
		this.username = args[0] as string;
		this.password = args[1] as string;
		this.email = args[2] as string;
		this.photo_id = args[3] as string ?? 0;
		this.online = args[4] as boolean ?? false;
		this.chat_ids = args[5] as number[] ?? [];
		this.id = args[6] as number ?? 0;
		this.created_at = args[7] as number ?? Date.now();
	}

	print_info() {
		console.log(`ID: ${this.id}, Username: ${this.username}, Password: ${this.password}, Email: ${this.email}`);
	}

	serialize(): UserType {
		const user:UserType = {
			username: this.username,
			id: this.id,
			email: this.email,
			created_at: this.created_at,
			avatar: this.photo_id
		}
		return user;
	}

	static getPropertyNames(): string[] {
		return ["username", "password", "email", "photo_id", "online", "chat_ids", "id", "created_at"];
	}
}
