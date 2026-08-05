

export interface IClient {
    typeClient: TypeClient
    email: string
    phone: string
    clientId: string
    code: string
}

export interface IClientIndividualDetail extends IClient {
    firstName: string
    lastName: string
    fullName: string
    ipn: string
    birthDate: string
    nationality: string
    passportNumber: string
}



export enum TypeClient {
    INDIVIDUALS = "C01",
    LEGAL_ENTITY = "C02",
    SOLE_PROPRIETOR = "C03"
}

export enum TypeClientReq {
     individuals="individuals",
    "legal-entity"="legal-entity",
    "sole-proprietor"="sole-proprietor"
}
export interface IClientIndividualsFilter {
    code: string
    department: string
    firstName: string
    ipn: string
    lastName: string
    numberDoc: string
    seriesDoc: string
    type: string
}

export interface IClientIndividualListItem {
    clientId: string
    fullName: string
    code: string
    ipn: string
    type: string
    passportNumber: string
    department: string
    status: string
}


interface IMeta {
    page: number,
    pageSize: number,
    totalItems: number,
    totalPages: number,
    hasNextPage: boolean,
    hasPrevPage: boolean,
}
export interface IClientPagination<T>
{
    data: T[],
    meta: IMeta
}
