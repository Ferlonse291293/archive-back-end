import busboy from 'busboy';
import { Transform } from 'node:stream';
import crypto from 'node:crypto';
import type { Request } from 'express';
import type { Readable } from 'node:stream';

export interface ParsedUpload {
    stream: Readable;
    filename: string;
    mimeType: string;
    isTruncated: () => boolean;
}

// Парсит multipart/form-data и отдаёт поток файла, как только он появился,
// не дожидаясь окончания загрузки
export const parseMultipartFile = (
    req: Request,
    maxFileSize: number
): Promise<ParsedUpload> => {
    return new Promise((resolve, reject) => {
        const bb = busboy({ headers: req.headers, limits: { fileSize: maxFileSize } });
        let fileFound = false;

        bb.on('file', (_field, fileStream, info) => {
            fileFound = true;
            let truncated = false;
            fileStream.on('limit', () => { truncated = true; });

            resolve({
                stream: fileStream,
                filename: info.filename,
                mimeType: info.mimeType,
                isTruncated: () => truncated,
            });
        });

        bb.on('error', reject);

        bb.on('close', () => {
            if (!fileFound) reject(new Error('NO_FILE_PROVIDED'));
        });

        req.pipe(bb);
    });
};

// Transform-поток: пропускает данные насквозь, попутно считая SHA-256 и размер
export const createHashingStream = () => {
    const hash = crypto.createHash('sha256');
    let size = 0;

    const stream = new Transform({
        transform(chunk, _enc, callback) {
            hash.update(chunk);
            size += chunk.length;
            callback(null, chunk);
        },
    });

    return {
        stream,
        getChecksum: () => hash.digest('hex'),
        getSize: () => size,
    };
};
