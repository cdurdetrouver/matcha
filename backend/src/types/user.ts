import { ImageType } from './image.ts';

export type UserType = {
	username: string;
	id: number;
	created_at: number;
	online: boolean;
	connected_at: number;
	complete_profile: boolean;
	email_verif: boolean;
	wanted: number;
	avatar?: ImageType;
	email?: string;
	gender?: string;
	sexual_preferences?: string;
	description?: string;
	interests?: string[];
	location: number[];
};
