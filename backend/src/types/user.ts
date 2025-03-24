export default class User {
	username: string;
	password: string;
	email: string;
	id: number = 0;
	created_at: number = Date.now();

	[key: string]: unknown;
	constructor(username: string, password: string, email: string, id?: number, created_at?: number) {
		this.username = username;
		this.password = password;
		this.email = email;
		if (id)
			this.id = id;
		if (created_at)
			this.created_at = created_at;
	}
	print_info() {
		console.log(`ID: ${this.id}, Username: ${this.username}, Password: ${this.password}, Email: ${this.email}`);
	}

	serialize() {
		return ({username: this.username, email: this.email, id: this.id, created_at: this.created_at});
	}

	static getPropertyNames(): string[] {
		return Object.getOwnPropertyNames(User.prototype)
		  .filter((prop) => prop !== 'constructor' && typeof User.prototype[prop as keyof User] !== 'function');
	  }
}
