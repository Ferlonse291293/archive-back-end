
import type {ITreeElements} from "../../types/tree-elements.interface.js";
export const DOCUMENT_STATUS = ['ACTIVE', 'ARCHIVED', 'SIGNED', 'DRAFT'];

export interface IDocumentRef {
    "id": string,
    "folderId": string,
    "version": number,
    "name": string,
    "dateCreated": number,
    "dateUpdate": number
}

type TreeElementsType = "ITEM" | "FOLDER"



export interface IDocumentTree extends  ITreeElements{
    content: IFolderDocument | IDocumentRef
    type: TreeElementsType
}

export interface IFolderDocument {
    id: string;
    name: string;
    parentFolderId?: string;
    parent?: IFolderDocument;
    children: IFolderDocument[];
    documentGroups: IDocumentGroup[];
}

export interface IDocumentGroup {
    id: string;
    clientId: string;
    folderId: string;
    title: string;
    versions: IDocument[];
    currentVersion?: IDocument;
}

export interface IDocument {
    id: string;
    groupId: string;
    createdAt: Date;
    updatedAt: Date;
    metadata: IMetadata;
    files: IDocumentFile[] ;
    group: IDocumentGroup;
}

export interface IMetadata {
    id: string;
    version: number;
    language: string;
    confidential: boolean;
    documentType: string;
    issueDate?: Date;
    expiryDate?: Date;
    issuingAuthority?: string;
    verificationStatus: VerificationStatus;
}

export interface IFile {
    id: string;
    fileName: string;
    mimeType: string;
    sizeBytes: number;
    storagePath: string;
    checksum: string;
    uploadedAt: Date;
}

export enum VerificationStatus {
    Pending = "PENDING",
    Verified = "VERIFIED",
    Rejected = "REJECTED",
}

export interface  IDocumentDto {
    id: string;
    metadata: IMetadataDto;
    versions: IDocumentVersionDto[];
    files: IFile[]
}

export interface  IDocumentVersionDto {
    documentId: string;
    version: number;
    name: string;
}

export interface  IMetadataDto extends IMetadata{
    createdAt: Date;
}

export interface IDocumentFile {
    documentId: string;
    file: IFile;
    fileId: string
}
