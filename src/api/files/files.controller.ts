import type { Request, Response } from 'express';
import {
    getDocumentMetadata
} from './files.service.js';

export const getMetadata = async (
    req: Request,
    res: Response
) => {

    const result =
        await getDocumentMetadata(
            req.params.idDocument as string
        );

    if (!result) {
        return res.status(404).json({
            message: 'Document not found'
        });
    }

    res.json(result);
};

export const downloadFile = async (
    req: Request,
    res: Response
) => {

    res.json({
        message: 'TODO'
    });

};
