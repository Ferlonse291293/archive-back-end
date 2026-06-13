export interface IDocumentFile {
    fileId: string;
    fileName: string;
    type: string;
}

export interface IUser {
    id: string,
    name: string,
    role: string
}

export interface IProfileResponse {
    user: IUser
    permissions: string[]
}




