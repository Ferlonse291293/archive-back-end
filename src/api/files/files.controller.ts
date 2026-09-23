import type { Request, Response } from 'express';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { s3PublicClient } from '../../lib/s3Client.js';
import {
    findFileByIdService,
    listFilesByDocumentService,
    createFileRecordService,
    uploadObjectToStorage,
    buildStoragePath,
} from './files.service.js';
import { parseMultipartFile, createHashingStream } from './files.utils.js';
import type { IFile } from '../documents/documents.types.ts';
import {EXPIRES_IN_LINK_FILE, MAX_FILE_SIZE} from "../../shared/const/file.js";

// GET /files/:id/url — presigned ссылка на скачивание (как было)
export const findFileById = async (
    req: Request<{ id: string }>,
    res: Response
) => {
    const { id } = req.params;
    const file: IFile | null = await findFileByIdService(id);
    if (!file) {
        return res.status(404).json({
            message: 'file not found'
        });
    }

    const command = new GetObjectCommand({
        Bucket: process.env.MINIO_BUCKET,
        Key: file.storagePath,
    });

    const url = await getSignedUrl(s3PublicClient, command, { expiresIn: EXPIRES_IN_LINK_FILE }); // 15 минут

    res.json({ url });
};

// GET /files/document/:documentId — список файлов документа
export const listFilesByDocument = async (req: Request, res: Response) => {
    const files = await listFilesByDocumentService(String(req.params.documentId));
    res.json(files);
};

// POST /files/document/:documentId — загрузка файла (multer.single('file'))
export const uploadFile = async (req: Request<{ documentId: string }>, res: Response) => {
    const { documentId } =  req.params;

    let parsed;
    try {
        parsed = await parseMultipartFile(req, MAX_FILE_SIZE);
    } catch (err: any) {
        if (err.message === 'NO_FILE_PROVIDED') {
            return res.status(400).json({ message: 'no file provided' });
        }
        console.error('multipart parse error', err);
        return res.status(400).json({ message: 'invalid upload' });
    }

    const storagePath = buildStoragePath(documentId, parsed.filename);
    const { stream: hashingStream, getChecksum, getSize } = createHashingStream();
    parsed.stream.pipe(hashingStream);

    try {
        await uploadObjectToStorage({
            storagePath,
            mimeType: parsed.mimeType,
            body: hashingStream,
        });
    } catch (err) {
        console.error('MinIO upload failed', err);
        return res.status(502).json({ message: 'storage upload failed' });
    }

    if (parsed.isTruncated()) {
        return res.status(413).json({ message: 'file too large' });
    }

    const record = await createFileRecordService({
        documentId,
        fileName: parsed.filename,
        mimeType: parsed.mimeType,
        sizeBytes: getSize(),
        storagePath,
        checksum: getChecksum(),
    });

    const url = await getSignedUrl(
        s3PublicClient,
        new GetObjectCommand({ Bucket: process.env.MINIO_BUCKET, Key: storagePath }),
        { expiresIn: 900 }
    );

    res.status(201).json({ ...record, url });
};
// DELETE /files/:id — удаление файла из MinIO и из БД
// export const deleteFile = async (req: Request, res: Response) => {
//     const file: IFile = await findFileByIdService(req.params.id);
//     if (!file) {
//         return res.status(404).json({ message: 'file not found' });
//     }
//
//     try {
//         await s3Client.send(new DeleteObjectCommand({
//             Bucket: process.env.MINIO_BUCKET,
//             Key: file.storagePath,
//         }));
//     } catch (err) {
//         console.error('MinIO delete failed', err);
//         return res.status(502).json({ message: 'storage delete failed' });
//     }
//
//     await deleteFileRecordService(file.id);
//
//     res.status(204).send();
// };
