import { Router } from 'express';
import {getClient, getClients} from "./clients.controller.js";
import {authMiddleware} from "../../middlewares/auth.middleware.js";
import {TypeClientReq} from "./clients.types.js";



const router = Router();

router.get('/individuals/:clientId', authMiddleware, getClient);

router.post(`/individuals`, authMiddleware, getClients);

export default router;
