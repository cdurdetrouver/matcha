import { ImageType } from "./image.ts";
import { UserType } from "./user.ts";

export type PostType = {
	user: UserType;
	posts: ImageType[];
	compatibility: number;
}
