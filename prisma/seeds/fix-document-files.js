import 'dotenv/config';
import crypto from 'crypto';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { ListObjectsV2Command } from '@aws-sdk/client-s3';
import { s3PublicClient } from '../../src/lib/s3Client.js';

const DRY_RUN = process.env.DRY_RUN !== 'false';

const adapter = new PrismaPg({
    connectionString: String(process.env.DATABASE_URL),
});

const prisma = new PrismaClient({ adapter });

const BUCKET = process.env.MINIO_BUCKET || 'document-files';
const PREFIX = process.env.MINIO_PREFIX || 'generated-files/';

function genId() {
    return crypto.randomBytes(12).toString('base64').replace(/[+/=]/g, '').slice(0, 16);
}

function mimeFromExt(name) {
    const ext = name.split('.').pop().toLowerCase();
    const map = {
        pdf: 'application/pdf',
        doc: 'application/msword',
        docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        xls: 'application/vnd.ms-excel',
        xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ppt: 'application/vnd.ms-powerpoint',
        pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        png: 'image/png',
        jpg: 'image/jpeg',
        jpeg: 'image/jpeg',
        gif: 'image/gif',
        svg: 'image/svg+xml',
        zip: 'application/zip',
        rar: 'application/vnd.rar',
        txt: 'text/plain',
        csv: 'text/csv',
        mp3: 'audio/mpeg',
        mp4: 'video/mp4',
        html: 'text/html',
        xml: 'application/xml',
        psd: 'image/vnd.adobe.photoshop',
    };
    return map[ext] || 'application/octet-stream';
}

async function listMinioFiles() {
    const files = [];
    let continuationToken;
    do {
        const resp = await s3PublicClient.send(new ListObjectsV2Command({
            Bucket: BUCKET,
            Prefix: PREFIX,
            ContinuationToken: continuationToken,
        }));
        for (const obj of resp.Contents || []) {
            if (obj.Key.endsWith('/')) continue;
            files.push({
                fileName: obj.Key.split('/').pop(),
                mimeType: mimeFromExt(obj.Key),
                sizeBytes: obj.Size,
                storagePath: obj.Key,
                checksum: (obj.ETag || '').replace(/"/g, ''),
                uploadedAt: obj.LastModified,
            });
        }
        continuationToken = resp.IsTruncated ? resp.NextContinuationToken : undefined;
    } while (continuationToken);
    return files;
}

async function main() {
    console.log(`DRY_RUN=${DRY_RUN}`);

    const realFiles = await listMinioFiles();
    console.log(`Найдено файлов в MinIO (bucket=${BUCKET}, prefix=${PREFIX}): ${realFiles.length}`);

    if (realFiles.length === 0) {
        throw new Error('В MinIO не найдено файлов по указанному BUCKET/PREFIX.');
    }

    const documents = await prisma.document.findMany({ select: { id: true } });
    console.log(`Найдено документов в БД: ${documents.length}`);

    if (documents.length === 0) {
        throw new Error('В таблице documents нет ни одной записи.');
    }

    const totalNewFiles = documents.length * realFiles.length;
    console.log(`Будет создано files/document_files: ${totalNewFiles} (documents=${documents.length} x files=${realFiles.length}, каждому документу — все ${realFiles.length} файлов)`);

    if (DRY_RUN) {
        console.log('DRY_RUN=true — ничего не меняю. Запустите с DRY_RUN=false, чтобы применить.');
        await prisma.$disconnect();
        return;
    }

    const fileRows = [];
    const docFileRows = [];

    for (const doc of documents) {
        for (const rf of realFiles) {
            const id = genId();
            fileRows.push({
                id,
                fileName: rf.fileName,
                mimeType: rf.mimeType,
                sizeBytes: rf.sizeBytes,
                storagePath: rf.storagePath,
                checksum: rf.checksum,
                uploadedAt: rf.uploadedAt,
            });
            docFileRows.push({ documentId: doc.id, fileId: id });
        }
    }

    console.log('Удаляю старые записи...');
    await prisma.documentFile.deleteMany({});
    await prisma.file.deleteMany({});
    console.log('Старые записи удалены.');

    const BATCH = 2000;
    for (let i = 0; i < fileRows.length; i += BATCH) {
        await prisma.file.createMany({ data: fileRows.slice(i, i + BATCH) });
        console.log(`files: ${Math.min(i + BATCH, fileRows.length)}/${fileRows.length}`);
    }
    for (let i = 0; i < docFileRows.length; i += BATCH) {
        await prisma.documentFile.createMany({ data: docFileRows.slice(i, i + BATCH) });
        console.log(`document_files: ${Math.min(i + BATCH, docFileRows.length)}/${docFileRows.length}`);
    }

    const filesCount = await prisma.file.count();
    const docFilesCount = await prisma.documentFile.count();
    console.log('Проверка после вставки:', { filesCount, docFilesCount, expected: totalNewFiles });

    if (filesCount !== totalNewFiles || docFilesCount !== totalNewFiles) {
        throw new Error('Числа не сходятся после вставки — проверьте данные вручную.');
    }

    console.log('Готово. Таблицы files и document_files пересозданы.');
    await prisma.$disconnect();
}

main().catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
});
