import { Router } from 'express';

import {getDocumentTree
} from './documents.controller.js';
import {authMiddleware} from "../../middlewares/auth.middleware.js";

const router = Router();

router.get('/tree/:clientId', authMiddleware, getDocumentTree);

router.get('/:documentId', authMiddleware, getDocumentTree);

export default router;
