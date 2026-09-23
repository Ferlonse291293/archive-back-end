import { Router } from 'express';
import {
    findFileById,
    uploadFile,
} from './files.controller.js';

const router = Router();

router.get('/:id', findFileById);
// router.get('/document/:documentId', listFilesByDocument);
router.post('/:documentId', uploadFile); // multer больше не нужен
// router.delete('/:id', deleteFile);

export default router;
