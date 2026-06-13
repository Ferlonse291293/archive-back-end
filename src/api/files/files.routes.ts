import { Router } from 'express';

import {
    getMetadata,
    downloadFile
} from './files.controller.js';

const router = Router();

router.get(
    '/:idDocument/metadata',
    getMetadata
);

router.get(
    '/files/:fileId/download',
    downloadFile
);

export default router;
