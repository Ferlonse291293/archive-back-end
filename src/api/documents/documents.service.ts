import fs from "fs";
import type {IDocumentRef, IDocumentTree, IFolderDocument} from "./documents.types.js";
import {buildTree} from "./documents.utils.js";

const documentsDb = JSON.parse(
    fs.readFileSync('./src/db/documents.json', 'utf-8')
);

const documentsRefDb = JSON.parse(
    fs.readFileSync('./src/db/document-references.json', 'utf-8')
);

const foldersDocumentsDb = JSON.parse(
    fs.readFileSync('./src/db/folders-documents.json', 'utf-8')
);




export const getDocumentTreeService =
    async (clientId: string) => {
        const documentsRef: IDocumentRef[]  = [...documentsRefDb]
        const foldersDocuments: IFolderDocument[] = [...foldersDocumentsDb]

    if(!documentsRef.length ||  !foldersDocuments.length){
        return null
    }
    if(foldersDocuments.length){

       return  buildTree(foldersDocuments, documentsRef)
    }

    };


