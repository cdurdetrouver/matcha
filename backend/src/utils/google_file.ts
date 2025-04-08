import { GetSignedUrlConfig, Storage } from '@google-cloud/storage';
import { BUCKET_NAME } from '../secret.ts';

const storage = new Storage({keyFilename: './google.env.json'});

export async function post_file(filename: string, file: File) {
  
	const fileContent = new Uint8Array(await file.arrayBuffer());
	await storage.bucket(BUCKET_NAME).file(filename).save(fileContent, {
		contentType: file.type,
	});
}

export async function get_signed_url(filename: string, expiration: number) {
	const file = storage.bucket(BUCKET_NAME).file(filename);
	const options: GetSignedUrlConfig = {
		version: 'v4',
		action: 'read',
		expires: Date.now() + expiration * 1000,
	};
	const [url] = await file.getSignedUrl(options);
	return url;
}

export async function delete_file(filename: string) {
	await storage.bucket(BUCKET_NAME).file(filename).delete();
}

