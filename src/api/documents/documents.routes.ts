import { Router } from 'express';

import {getDocumentTree
} from './documents.controller.js';
import {authMiddleware} from "../../middlewares/auth.middleware.js";

const router = Router();

router.get('/:clientId', authMiddleware, getDocumentTree);

export default router;
