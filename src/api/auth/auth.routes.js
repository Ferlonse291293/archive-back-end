import { Router } from 'express';
import { login, refresh, profile } from './auth.controller.js';
const router = Router();
router.post('/login', login);
router.post('/refresh', refresh);
router.get('/profile', profile);
export default router;
//# sourceMappingURL=auth.routes.js.map