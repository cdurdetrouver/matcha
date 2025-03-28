import { GoogleStorage } from 'https://deno.land/x/google_cloud_storage@v0.1.1/mod.ts';
import { BUCKET_NAME } from '../secret.ts';

type ServiceAccount = {
	type: string;
	project_id: string;
	private_key_id: string;
	private_key: string;
	client_email: string;
	client_id: string;
	auth_uri: string;
	token_uri: string;
	auth_provider_x509_cert_url: string;
	client_x509_cert_url: string;
	universe_domain: string;
};

type FormDataFile = {
	content?: Uint8Array;
	contentType: string;
	filename?: string;
	name: string;
	originalName: string;
};

const serviceAccount = JSON.parse(
	await Deno.readTextFile('google.env.json')
) as ServiceAccount;

const storage = new GoogleStorage(
	serviceAccount,

	'https://www.googleapis.com/auth/devstorage.full_control',
	{
		name: BUCKET_NAME,
		region: 'asia-northeast3',
	}
);

export async function post_file(file: File, filename: string) {
	const fileName = file.name;

	const formDataFile: FormDataFile = {
		contentType: file.type || 'application/octet-stream',
		originalName: fileName,
		name: fileName,
	};

	const content = await file.arrayBuffer();
	formDataFile.content = new Uint8Array(content);

	await storage.upload(formDataFile, filename);
}

export async function get_signed_url(filename: string, expiration?: number) {
	const signedUrl = await storage.getSignedUrl(filename, expiration);

	return signedUrl;
}
