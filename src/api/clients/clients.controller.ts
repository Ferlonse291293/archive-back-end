import type { Request, Response } from 'express';
import { getIndividualClientService, getIndividualClientsService} from "./clients.service.js";

import type {PAGINATION_SORT} from "../../shared/const/pagination.js";
import type {IClientIndividualsFilter} from "./clients.types.js";


export const getClients = async (req: Request, res: Response) => {
    const { page, limit, sort } = req.query;
    const bodyRequest: IClientIndividualsFilter = req.body;

    if (!page || !limit || !sort) {
        return res.status(400).json({
            message: 'request without params'
        });
    }

    if (!bodyRequest.ipn && !bodyRequest.firstName && !bodyRequest.lastName && !bodyRequest.code) {
        return res.status(400).json({
            message: 'body should have ipn or firstName or lastName or code'
        });
    }

    const result = await getIndividualClientsService(
        Number(page),
        Number(limit),
        sort as PAGINATION_SORT,
        bodyRequest
    );

    if (!result) {
        return res.status(404).json({ message: 'Clients not found' });
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
    const result = await getIndividualClientService(req.params.clientId)
    if( !result){
        return res.status(404).json({
            message: 'Client not found'
        });
    }

    return res.status(200).json(result);

}
