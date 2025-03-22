import type { PersonalUser } from '$lib/types/user';

declare global {
	namespace App {
		interface Locals {
			user: PersonalUser | null;
		}
	}
}
