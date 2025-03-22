//if modifying this file, modify new user call to p'tite boucle for dans le constructeur
export class user {
	username: string;
	password: string;
	email: string;
	id: number;
	created_at: Date;
	constructor(username: string, password: string, email: string, db_info: string[5]) {
		if (!db_info) {
			this.username = username;
			this.password = password;
			this.email = email;
		}
		else {
			this.username = db_info[0];
			this.password = db_info[1];
			this.email = db_info[2];
			this.id = db_info[3];
			this.created_at = db_info[4];
		}
	}
	print_info() {
		console.log(`ID: ${this.id}, Username: ${this.username}, Password: ${this.password}, Email: ${this.email}`);
	}
	serialize() {
		return ({username: this.username, email: this.email, id: this.id, created_at: this.created_at});
	}
}
