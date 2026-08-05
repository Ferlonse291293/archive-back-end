import type {IClientIndividualDetail, IClientIndividualListItem} from "./clients.types.js";


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


export const formatClientToItem = (client: IClientIndividualDetail):IClientIndividualListItem => {
        return {
            clientId: client.clientId,
            fullName: client.fullName,
            code: client.code,
            ipn: client.ipn,
            type: client.typeClient,
            passportNumber: client.passportNumber,
            department: 'POST06',
            status: "OPEN"
        }
}

export const flattenClient = (client): IClientIndividualDetail => {
    const { individual, ...rest } = client;
    return { ...rest, ...individual };
}

