export class user {
    id: number;
    username: string;
    password: string;
    email: string;
    constructor(id: number, username: string, password: string, email: string) {
        this.id = id;
        this.username = username;
        this.password = password;
        this.email = email;
    }
    print_info() {
        console.log(`ID: ${this.id}, Username: ${this.username}, Password: ${this.password}, Email: ${this.email}`);
    }
}
