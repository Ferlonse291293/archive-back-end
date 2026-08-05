import { Router } from 'express';
import {
    options
} from './options.controller.js';
import {authMiddleware} from "../../middlewares/auth.middleware.js";

const router = Router();

router.get('/',authMiddleware, options);


export default router;
