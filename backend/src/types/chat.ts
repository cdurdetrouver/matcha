export default class Chat {
	name: string;
	participants_ids: number[] = [];
	messages_ids: number[] = [];
	id: number = 0;
	created_at: number = Date.now();

	constructor(name: string, id?: number, created_at?: number, participants?: number[], messages?: number[]) {
		this.name = name;
		if (id)
			this.id = id;
		if (created_at)
			this.created_at = created_at;
		if (participants)
			this.participants_ids = participants;
		if (messages)
			this.messages_ids = messages;
	}

	serialize() {
		return ({name: this.name, id: this.id, created_at: this.created_at});
	}

	static getPropertyNames(): string[] {
		return Object.getOwnPropertyNames(Chat.prototype)
		  .filter((prop) => prop !== 'constructor' && typeof Chat.prototype[prop as keyof Chat] !== 'function');
	}
}