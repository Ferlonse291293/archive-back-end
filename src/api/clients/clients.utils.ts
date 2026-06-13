import type {IClient, IClientRes} from "./clients.types.js";
import {TypeClient} from "./clients.types.js";

export const buildPaginationMeta = (
    totalItems: number,
    page: number,
    limit: number
) => {
    const totalPages = Math.ceil(totalItems / limit);

    return {
        page,
        limit,
        totalItems,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
    };
};


export const formatResClient = (clients: IClient[], typeClient: TypeClient):IClientRes[] => {
    return  clients.map(el => {
        return {
            clientId: el.clientId,
            fullName: el.fullName,
            code: el.code,
            ipn: el.ipn,
            type: typeClient,
            passportNumber: el.passportNumber,
            department: 'POST06',
            status: "OPEN"
        }
    })
}
