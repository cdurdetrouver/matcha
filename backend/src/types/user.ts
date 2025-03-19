export class user {
	username: string;
	password: string;
	email: string;
	token: string;
	is_valid_token: date;
	id: number;
	created_at: Date;
	constructor(username: string, password: string, email: string, token: string, is_valid_token: date, db_info: string[5]) {
		if (!db_info) {
			this.username = username;
			this.password = password;
			this.email = email;
			this.token = token;
			this.is_valid_token = is_valid_token
		}
		else {
			this.username = db_info[0];
			this.password = db_info[1];
			this.email = db_info[2];
			this.token = db_info[3];
			this.is_valid_token = db_info[4];
			this.created_at = db_info[5];
		}
	}
	print_info() {
		console.log(`ID: ${this.id}, Username: ${this.username}, Password: ${this.password}, Email: ${this.email}`);
	}
	serialize() {
		return ({username: this.username, email: this.email, id: this.id, created_at: this.created_at});
	}
}
