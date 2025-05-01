import { type Image } from './image';

export type User = {
	username: string;
	id: number;
	created_at: number;
	online: boolean;
	connected_at: number;
	complete_profile: boolean;
	email_verif: boolean;
	wanted: number;
	avatar?: Image;
	email?: string;
	gender?: string;
	sexual_preferences?: string;
	description?: string;
	interests?: string[];
	location: number[];
	auth_provider: string;
	birthdate?: string;
	mbti?: string;
};
