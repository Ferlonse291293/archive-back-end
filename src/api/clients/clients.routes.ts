import { Router } from 'express';
import {getClient, getClients} from "./clients.controller.js";
import {authMiddleware} from "../../middlewares/auth.middleware.js";



const router = Router();

router.get('/:clientId', authMiddleware, getClient);

router.post('/', authMiddleware, getClients);

export default router;
