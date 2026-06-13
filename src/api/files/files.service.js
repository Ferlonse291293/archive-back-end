import fs from 'fs';
import path from 'path';
import { documents } from './files.mock.ts';
import { calculateFileHash } from '../../utils/hash.js';
const FILES_DIR = path.resolve('./src/files');
export const getDocumentMetadata = async (idDocument) => {
    const files = documents[idDocument];
    if (!files)
        return null;
    return Promise.all(files.map(async (file) => {
        const filePath = path.join(FILES_DIR, file.fileId);
        const stats = fs.statSync(filePath);
        const hash = await calculateFileHash(filePath);
        return {
            ...file,
            fileSize: stats.size,
            hash
        };
    }));
};
//# sourceMappingURL=files.service.js.map
