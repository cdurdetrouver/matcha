export default class Message {
	content: string;
	author_id: number;
	message_type: string;
	id: number = 0;
	send_at: number = Date.now();
	constructor(content: string, author_id: number, message_type: string, id: number, send_at: number) {
		this.content = content;
		this.author_id = author_id;
		this.message_type = message_type;
		this.id = id;
		this.send_at = send_at;
	}
	serialize() {
		return ({content: this.content, author_id: this.author_id, message_type: this.message_type, id: this.id, send_at: this.send_at});
	}

	static getPropertyNames(): string[] {
		return Object.getOwnPropertyNames(Message.prototype)
		  .filter((prop) => prop !== 'constructor' && typeof Message.prototype[prop as keyof Message] !== 'function');
	}
}