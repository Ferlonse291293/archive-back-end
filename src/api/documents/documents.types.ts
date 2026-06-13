import type {IFileReference} from "../files/files.types.js";
import type {ITreeElements} from "../../types/tree-elements.interface.js";
export const DOCUMENT_STATUS = ['ACTIVE', 'ARCHIVED', 'SIGNED', 'DRAFT'];


export interface IDocument {
    "documentId": string,
    "clientId": string,
    "title": string,
    "type": string,
    "status": string[],
    "createdAt": number,
    "updatedAt": number,
    "metadata": {
        "version": number,
        "language": string,
        "confidential": boolean
    },
    "files": IFileReference[]
}

export interface IDocumentRef {
    "id": string,
    "folderId": string,
    "version": number,
    "name": string,
    "dateCreated": number,
    "dateUpdate": number
}

export interface IFolderDocument {
    "id": string,
    "name": string,
    "parentFolderId": string

}

type TreeElementsType = "DOCUMENT" | "FOLDER"



export interface IDocumentTree extends  ITreeElements{
    content: IFolderDocument | IDocumentRef
    type: TreeElementsType
}
