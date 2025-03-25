export default class Notif {
	name: string;
	content: string;
	notif_type: string;
	id_target: number;
	id: number = 0;
	created_at: number = Date.now();

	constructor(name: string, content: string, notif_type: string, id_target: number, id?: number, created_at?: number) {
		this.name = name;
		this.content = content;
		this.notif_type = notif_type;
		this.id_target = id_target;
		if (id)
			this.id = id;
		if (created_at)
			this.created_at = created_at;
	}

	serialize() {
		return ({name: this.name, content: this.content, notif_type: this.notif_type, id: this.id, created_at: this.created_at});
	}

	static getPropertyNames(): string[] {
		return Object.getOwnPropertyNames(Notif.prototype)
		  .filter((prop) => prop !== 'constructor' && typeof Notif.prototype[prop as keyof Notif] !== 'function');
	}
}