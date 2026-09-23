import { Router } from 'express';

import {
    getDocument, getDocumentTree
} from './documents.controller.js';
import {authMiddleware} from "../../middlewares/auth.middleware.js";

const router = Router();

router.get('/tree/:clientId', authMiddleware, getDocumentTree);

router.get('/:documentId', authMiddleware, getDocument);

export default router;
