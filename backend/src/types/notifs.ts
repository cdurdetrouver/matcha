export type NotifType = {
	content: string;
	redirect: string;
	id: number;
	send_at: number;
};

// export class Notif {
// 	name: string;
// 	content: string;
// 	notif_type: string;
// 	id_target: number;
// 	id: number = 0;
// 	created_at: number = Date.now();

// 	[key: string]: unknown;
// 	constructor(...args: unknown[]) {
// 		this.name = args[0] as string;
// 		this.content = args[1] as string;
// 		this.notif_type = args[2] as string;
// 		this.id_target = args[3] as number;
// 		this.id = (args[4] as number) ?? 0;
// 		this.created_at = (args[5] as number) ?? 0;
// 	}

// 	serialize() {
// 		return ({name: this.name, content: this.content, notif_type: this.notif_type, id: this.id, created_at: this.created_at});
// 	}

// 	static getPropertyNames(): string[] {
// 		return ["name", "content", "notif_type", "id_target", "id", "created_at"];
// 	}
// }
