import type { Request, Response } from 'express';
import {getClientsService, getClientService} from "./clients.service.js";

export const getClients = async (req: Request, res: Response) => {
    const { page, limit, sort } = req.query;
    const body = req.body;

  console.log( body )
    if (!page) {
        return res.status(400).json({
            message: 'request without page params'
        });
    }

    if (!limit) {
        return res.status(400).json({
            message: 'request without limit params'
        });
    }

    if (!sort) {
        return res.status(400).json({
            message: 'request without sort params'
        });
    }

    const result = await  getClientsService(page, limit, sort);

    if (!result) {
        return res.status(404).json({
            message: 'Clients not found'
        });
    }

    return res.status(200).json(result);
};

export const getClient = async (
    req: Request,
    res: Response
) =>{
    if(!req.params.clientId){
        return res.status(400).json({
            message: 'request without clientId params'
        });
    }
    const result = await getClientService(req.params.clientId)

    if( !result){
        return res.status(404).json({
            message: 'Client not found'
        });
    }

    return res.status(200).json(result);

}
