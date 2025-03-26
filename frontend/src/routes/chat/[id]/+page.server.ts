import type { Message } from "$lib/types/chat";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ parent }) => {
	const {chatid, chats} = await parent();
	let messages: Message[] = [];
	if (chatid == 1)
	{
		messages = [
			{
				id: 1,
				message: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis vehicula sollicitudin sollicitudin. Quisque porttitor turpis et molestie vestibulum. Donec ut volutpat sapien, ut dignissim dolor. Vivamus dictum congue tortor eget dignissim. Donec metus risus, viverra ac lobortis vel, dignissim et lacus. Nulla vitae lectus cursus ante malesuada bibendum. Morbi ac euismod diam, posuere interdum ante. Sed sem nulla, mattis ut malesuada ac, facilisis in augue. Praesent scelerisque arcu non nulla sollicitudin, et porta tellus aliquam. Praesent in mollis lacus, sit amet scelerisque tortor. Praesent nec purus finibus, commodo dui sed, faucibus elit. Donec id congue purus. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Nullam pulvinar hendrerit purus vel vulputate. Etiam fringilla nec lectus id volutpat. Vivamus tincidunt efficitur nisi, sit amet molestie quam tincidunt sit amet. Proin sed gravida turpis. Donec dignissim, leo eu varius hendrerit, lacus nunc sagittis massa, ac accumsan lacus elit sed massa. Ut tellus elit, semper in nisl et, interdum tincidunt odio. Sed accumsan neque arcu, eget sodales tellus maximus at. Suspendisse blandit porta diam vel vestibulum. Etiam ac ex hendrerit, convallis sem in, blandit dolor. Morbi maximus, purus vitae vulputate blandit, diam sem molestie orci, id posuere dolor felis hendrerit magna. Sed eget est ultricies, blandit quam ac, gravia mi. Pellentesque sed sapien sem. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Aliquam feugiat ullamcorper rhoncus. Proin hendrerit risus ut velit eleifend venenatis. Mauris eget enim sit amet risus commodo mattis in non lacus. Nullam nec est fringilla, elementum lorem sed, semper orci. Vestibulum ornare elit ac metus varius hendrerit. Vestibulum sed ante hendrerit tellus vestibulum faucibus. Suspendisse congue congue justo, non porttitor nulla suscipit non. Fusce et luctus orci. Maecenas nulla erat, ultrices non urna vel, tempor dictum dui. Praesent blandit eget enim ut egestas. Sed convallis varius nibh eu gravida. Mauris eu magna sit amet erat fringilla ullamcorper. Sed quis mi nisi. Donec non massa tempus, aliquet lectus at, finibus velit. Duis sed orci vitae lorem hendrerit faucibus. Fusce facilisis aliquam velit. Curabitur a commodo diam. Nunc semper, sem eu finibus lacinia, augue lectus luctus justo, ac eleifend ante nunc sagittis tellus. Curabitur ipsum magna, ultricies eu lorem a, imperdiet maximus tortor. Donec malesuada sem a pharetra mollis. Ut faucibus diam sed quam egestas mattis. Sed libero enim, ultrices at gravida ac, venenatis quis risus. Vestibulum rutrum iaculis consequat. Nullam semper eget libero at bibendum. Praesent aliquam quam vitae egestas scelerisque. Vestibulum at quam sed arcu tincidunt aliquet sed ac justo. Sed ut laoreet nibh, ac commodo arcu. Ut lorem nisi, varius sed ultricies non, aliquam vel tellus. Aliquam rutrum metus nec mi convallis, a sodales purus tempus. Donec nisi ipsum, dapibus in ligula at, ullamcorper pretium nisi. Praesent nulla enim, fringilla at nibh ut, placerat vulputate mauris. ",
				author: {
					username: 'cdurdetrouver',
					id: 1,
					created_at: Date.now(),
					avatar: '/user.jpeg'
				},
				type: "chat",
				created_at: Date.now()
			},
			{
				id: 2,
				message: 'Hello, how are you ?',
				author: {
					username: 'blast',
					id: 2,
					created_at: Date.now(),
					avatar: '/blast.jpg'
				},
				type:"chat",
				created_at: Date.now()
			},
			{
				id: 3,
				author: {
					username: 'cdurdetrouver',
					id: 1,
					created_at: Date.now(),
					avatar: '/user.jpeg'
				},
				type: "image",
				image:"/outerwilds.jpg",
				created_at: Date.now()
			},
			{
				id: 4,
				author: {
					username: 'cdurdetrouver',
					id: 1,
					created_at: Date.now(),
					avatar: '/user.jpeg'
				},
				type: "chat",
				message:"Hey, regarde ce website trop cool : https://cdurdetrouver.fr",
				created_at: Date.now()
			},
			{
				id: 5,
				author: {
					username: 'blast',
					id: 2,
					created_at: Date.now(),
					avatar: '/blast.jpg'
				},
				type: "video",
				video:"https://dn720407.ca.archive.org/0/items/rick-roll/Rick%20Roll.ia.mp4",
				created_at: Date.now()
			},
			{
				id: 6,
				type: "announce",
				message: "Blast has leave the channel !",
				created_at: Date.now()
			},
		];
	}
	
	return {
		messages: messages
	};
};
