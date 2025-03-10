export class user {
    username: string;
    password: string;
    email: string;
    id: number;
    created_at: Date;
    constructor(username: string, password: string, email: string, id: number, created_at: Date) {
        this.username = username;
        this.password = password;
        this.email = email;
        if (id && created_at) {
            this.id = id;
            this.created_at = created_at;
        }
    }
    print_info() {
        console.log(`ID: ${this.id}, Username: ${this.username}, Password: ${this.password}, Email: ${this.email}`);
    }
    serialize() {
        return ({username: this.username, email: this.email, id: this.id, created_at: this.created_at});
    }
}
