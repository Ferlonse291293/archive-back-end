import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import crypto from "node:crypto";

import { Upload } from '@aws-sdk/lib-storage';
import { s3Client } from '../../lib/s3Client.js';
import type { Readable } from 'node:stream';
import type {IFile} from "../documents/documents.types.js";

const adapter = new PrismaPg({
    connectionString: String(process.env.DATABASE_URL),
});
const prisma = new PrismaClient({ adapter });


export const findFileByIdService = async (id: string): Promise<IFile | null> => {
    const file = await prisma.file.findUnique({ where: { id } });
    if (!file) return null;
    return file;
};

// File не хранит documentId напрямую — связь идёт через join-таблицу DocumentFile
export const listFilesByDocumentService = async (documentId: string) => {
    return prisma.file.findMany({
        where: { documentFiles: { some: { documentId } } },
        orderBy: { uploadedAt: "desc" },
    });
};

// Создаёт File и сразу привязывает его к документу через DocumentFile
export const createFileRecordService = async (data: {
    documentId: string;
    fileName: string;
    mimeType: string;
    sizeBytes: number;
    storagePath: string;
    checksum: string;
}) => {
    return prisma.file.create({
        data: {
            id: crypto.randomUUID(),
            fileName: data.fileName,
            mimeType: data.mimeType,
            sizeBytes: data.sizeBytes,
            storagePath: data.storagePath,
            checksum: data.checksum,
            uploadedAt: new Date(),
            documentFiles: {
                create: { documentId: data.documentId },
            },
        },
    });
};

// Удаляем сначала связь в DocumentFile (на случай отсутствия onDelete: Cascade в схеме),
// затем сам File
export const deleteFileRecordService = async (id: string) => {
    return prisma.$transaction([
        prisma.documentFile.deleteMany({ where: { fileId: id } }),
        prisma.file.delete({ where: { id } }),
    ]);
};

// SHA-256 контрольная сумма содержимого файла
export const computeChecksum = (buffer: Buffer): string =>
    crypto.createHash("sha256").update(buffer).digest("hex");

// Ключ объекта в MinIO: generated-files/<documentId>/<uuid>-<имя>
export const buildStoragePath = (documentId: string, originalName: string): string => {
    const safeName = originalName.replace(/[^a-zA-Z0-9._-]/g, "_");
    return `generated-files/${documentId}/${crypto.randomUUID()}-${safeName}`;
};

export const uploadObjectToStorage = async (params: {
    storagePath: string;
    mimeType: string;
    body: Readable;
}): Promise<void> => {
    const upload = new Upload({
        client: s3Client,
        params: {
            Bucket: process.env.MINIO_BUCKET,
            Key: params.storagePath,
            Body: params.body,
            ContentType: params.mimeType,
        },
        queueSize: 4,
        partSize: 10 * 1024 * 1024, // 10 MB
    });

    await upload.done();
};
