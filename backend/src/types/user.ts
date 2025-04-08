import { ImageType } from "./image.ts";

export type UserType = {
	username: string;
	id: number;
	email?: string;
	created_at: number;
	connected_at: number;
	avatar?: ImageType;
}
