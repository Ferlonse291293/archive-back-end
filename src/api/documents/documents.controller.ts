import type { Request, Response } from 'express';
import {getDocumentByIdService, getDocumentTreeService} from "./documents.service.js";



export const getDocumentTree = async (
    req: Request<{ clientId: string }>,
    res: Response
) =>{
    const result = await getDocumentTreeService(req.params.clientId)
    if(!result){
        return res.status(400).json({
            message: 'Clients without tree'
        });
    }

    return res.status(200).json(result);

}

export const getDocument = async (
    req: Request<{ documentId: string }>,
    res: Response
) =>{
    const result = await getDocumentByIdService(req.params.documentId)
    if(!result){
        return res.status(404).json({
            message: 'Document not found'
        });
    }

    return res.status(200).json(result);
}





