import type { Request, Response } from 'express';
import {getDocumentTreeService} from "./documents.service.js";



export const getDocumentTree = async (
    req: Request,
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
