export interface IClient {
    "firstName": string,
    "lastName": string,
    "fullName": string,
    "email": string,
    "phone": string,
    "birthDate": string,
    "nationality": string,
    "passportNumber": string,
    "ipn": string,
    "clientId": string,
    "code": string
}


export enum TypeClient {
    INDIVIDUALS = "C01",
    LEGAL_INDIVIDUALS = "C02",
    INDIVIDUALS_ENTREPRENEURS  = "C03"
}


export interface IClientRes {
    "clientId": string
    "fullName": string,
    "code": string,
    "ipn": string,
    "type": string,
    "passportNumber": string,
    "department": string,
    "status": string
}

interface IPagination {
    page: number,
    pageSize: number,
    totalItems: number,
    totalPages: number,
    hasNextPage: boolean,
    hasPrevPage: boolean,
}


export interface IClientPagination
{
    data: IClient[],
    meta: IPagination
}
