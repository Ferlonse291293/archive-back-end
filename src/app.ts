import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import authRoutes from './api/auth/auth.routes.js';
import clientRouter from './api/clients/clients.routes.js';
import documentRoutes from './api/documents/documents.routes.js';
import fileRoutes from './api/files/files.routes.js';
import optionsRoutes from './api/options/options.routes.js';


const app = express();

app.use(express.json());

app.use(cookieParser());

app.use(cors(
    {
        origin: 'http://localhost:4200',
        credentials: true,
        allowedHeaders: [
            'Content-Type',
            'x-csrf-token'
        ]
    }
));

app.use((req, res, next) => {
    res.set('Cache-Control', 'no-store');
    next();
});




app.use('/api/auth', authRoutes);
app.use('/api/clients', clientRouter);
app.use('/api/documents', documentRoutes);
app.use('/api/files',  fileRoutes);
app.use('/api/options',  optionsRoutes);

export default app;
