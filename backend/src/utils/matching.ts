import { Relations_Users } from '../db_objects/relations_users.ts';
import { User } from '../db_objects/user.ts';
import { MatchContextType } from '../types/matchcontext.ts';
import { similarityScore } from './similarity.ts';

export async function has_liked(userA: number, userB: number): Promise<number> {
	const liked = await Relations_Users.get_relation(userA, userB);
	if (liked == null) return 0;

	const timeInSeconds = liked.time_to_match / 1000;

	if (timeInSeconds <= 120) return 2;

	if (timeInSeconds >= 300) return 1;

	return 2 - (timeInSeconds - 120) / (300 - 120);
}

export async function matchingScore(
	userA: User,
	userB: User,
	userA_tags: string[],
	userB_tags: string[],
	context: MatchContextType,
	mostSimilarUserstoA: User[]
): Promise<number> {
	const score = similarityScore(userA, userB, userA_tags, userB_tags);
	let boost = 0;
	let maxBoost = 0;

	maxBoost += mostSimilarUserstoA.length * 2;
	for (const user of mostSimilarUserstoA) {
		if (user.id !== userB.id) {
			boost += await has_liked(user.id, userB.id);
		}
	}

	maxBoost += 4;
	const viewScore =
		(Math.min(context.profileViewTimeAtoB / 1000, 60) / 60) * 2 +
		(Math.min(context.profileViewTimeBtoA / 1000, 60) / 60) * 2;
	boost += viewScore;

	maxBoost += 2;
	const fastLikeA = context.timeToLikeAtoB / 1000 < 20 ? 1 : 0;
	const fastLikeB = context.timeToLikeBtoA / 1000 < 20 ? 1 : 0;
	boost += fastLikeA + fastLikeB;

	maxBoost += 3;
	if (context.hasLikedEachOther) boost += 3;

	maxBoost += 2;
	const now = new Date().getTime();
	const activeA =
		(now - new Date(Number(userA.connected_at)).getTime()) / 1000;
	const activeB =
		(now - new Date(Number(userB.connected_at)).getTime()) / 1000;
	if (activeA < 3600) boost += 1;
	if (activeB < 3600) boost += 1;

	return (score + boost) / (1 + maxBoost);
}
