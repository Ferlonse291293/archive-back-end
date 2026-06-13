import { Router } from 'express';
import {
    login,
    refresh,
    profile, logout
} from './auth.controller.js';
import {authMiddleware} from "../../middlewares/auth.middleware.js";

const router = Router();

router.post('/login', login);
router.post('/logout', logout);
router.post('/refresh',  authMiddleware, refresh);

router.get('/profile', authMiddleware, profile);

export default router;
