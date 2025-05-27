import {
    S3Client,
    GetObjectCommand,
    PutObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3Client = new S3Client({
    region: "ap-south-1",
    credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY_ID!,
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
    },
});

const bucket = "ciphershare";

export async function putObjectUrl() {
    const key = `uploads/files/file-${Date.now()}.json`;
    const command = new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        ContentType: "application/json",
    });
    const url = await getSignedUrl(s3Client, command);
    return { url, key };
}

export async function getObjectUrl(key: string) {
    const command = new GetObjectCommand({
        Bucket: bucket,
        Key: key,
    });
    const url = await getSignedUrl(s3Client, command);
    return url;
}
