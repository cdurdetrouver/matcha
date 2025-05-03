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
	auth_provider: string;
	birthdate?: string;
	mbti?: string;
	fame_rate: number;
};

export type UserTypeGoogle = {
	name: string;
	email: string;
	picture: string;
	verified_email: boolean;
};

export type UserTypeIntra = {
	email: string;
	login: string;
	image: {
		link: string;
	};
	location: string;
};
