import { Context, Hono } from 'hono';
import { GoogleStorage } from 'https://deno.land/x/google_cloud_storage@v0.1.1/mod.ts';
import serviceAccount from "../../google.env.json" with { type: "json" };
import { BUCKET_NAME } from "../secret.ts";

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

const app = new Hono();

const storage = new GoogleStorage(
    serviceAccount as ServiceAccount,
    "https://www.googleapis.com/auth/devstorage.full_control",
    {
        name: BUCKET_NAME,
        region: "asia-northeast3",
    }
);



app.post('/', async (c : Context) => {
    try {
        const formData = await c.req.formData();
        const file = formData.get('file');

        if (!file) {
            return c.json({ error: 'No file uploaded' }, 400);
        }
        if (file instanceof File) {
            const fileName = file.name;

            const formDataFile: FormDataFile = {
                contentType: file.type || "application/octet-stream",
                originalName: fileName,
                name: fileName,
            };

            const content = await file.arrayBuffer();
            formDataFile.content = new Uint8Array(content);

            await storage.upload(formDataFile, fileName);

            return c.json({ message: 'File uploaded successfully!'}, 200);
        }
    } catch (err) {
        return c.json({ message: 'Error uploaded file : ' + err}, 400);
    }

});

app.get('/', async (c : Context) => {
    try {
        const signedUrl = await storage.getSignedUrl('Screenshot from 2025-01-23 17-12-42.png', 900);

        return c.json({ url: signedUrl}, 200);
    } catch (err) {
        return c.json({ message: 'Error get file : ' + err}, 400);
    }

});


export default app;