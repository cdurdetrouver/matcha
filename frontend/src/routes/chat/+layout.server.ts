export const load = async ({ params }) => {
	return {
		chatid: Number(params.id)
	};
};
