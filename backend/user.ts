export class user {
    username: string;
    password: string;
    email: string;
    id: number;
    created_at: Date;
    constructor(username: string, password: string, email: string) {
        this.username = username;
        this.password = password;
        this.email = email;
    }
    print_info() {
        console.log(`ID: ${this.id}, Username: ${this.username}, Password: ${this.password}, Email: ${this.email}`);
    }
    serialize() {

    }
}

export function user_serializer(user: user) {
    const csv = JSON.stringify(user, {
        columns: [
          "username",
          "email",
          "id",
          "created_at",
        ],
      });
    return csv;
}

export function user_deserializer(csv: string) {
    const user: user = JSON.parse(csv, columns: ['username', 'email', 'id', 'created_at']);
    return user;
}