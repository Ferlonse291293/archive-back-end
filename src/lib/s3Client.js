import { S3Client } from '@aws-sdk/client-s3';

// клиент для внутренних операций backend (upload/delete/list через backend)
export const s3Client = new S3Client({
    endpoint: process.env.MINIO_ENDPOINT, // http://minio:9000
    region: 'us-east-1',
    credentials: {
        accessKeyId: process.env.MINIO_ACCESS_KEY,
        secretAccessKey: process.env.MINIO_SECRET_KEY,
    },
    forcePathStyle: true,
});

// отдельный клиент только для генерации presigned URL, отдаваемых браузеру
export const s3PublicClient = new S3Client({
    endpoint: process.env.MINIO_PUBLIC_ENDPOINT, // http://localhost:9000
    region: 'us-east-1',
    credentials: {
        accessKeyId: process.env.MINIO_ACCESS_KEY,
        secretAccessKey: process.env.MINIO_SECRET_KEY,
    },
    forcePathStyle: true,
});
