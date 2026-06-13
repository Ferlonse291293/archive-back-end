import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRoutes from './api/auth/auth.routes';
import documentRoutes from './api/files/files.routes.js';
const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));
app.use('/api/auth', authRoutes);
app.use('/api/files', documentRoutes);
export default app;
//# sourceMappingURL=app.js.map
