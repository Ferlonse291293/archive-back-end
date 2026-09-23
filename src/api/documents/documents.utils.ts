import type {
    IDocument,
    IDocumentDto, IDocumentFile,
    IDocumentGroup,
    IDocumentRef,
 IDocumentVersionDto, IFile,
    IFolderDocument,
} from "./documents.types.js";

const addDocuments = (documentsRef: IDocumentRef[] , id: string)  => {
    const docForFolder = documentsRef.filter(el => el.folderId === id)
    if(docForFolder.length === 0){
        return []
    }
    return  docForFolder.map(el => {
        return {
            content: el,
            type: 'ITEM',
            id: el.id,
            parentId:  el.folderId,
            name: el.name,
            children: null
        }

    })
}


export const buildTree = (arrayFolders: IFolderDocument[] , arrDoc: IDocumentRef[] ) => {
    let obj = arrayFolders.reduce((acc, el) => {
        acc[el.id] = {
            content: null,
            type: 'FOLDER',
            id: el.id,
            parentId:  el.parentFolderId,
            name: el.name,
            children: addDocuments(arrDoc,el.id)
        }
        return acc
    }, {})
    const tree = [] ;

    for (const node of Object.values(obj)) {
        if (node.parentId === null) {
            tree.push(node);
        } else {
            const parent = obj[node.parentId];
            if (parent) {
                parent.children.push(node);
            }
        }
    }
    return tree

}

export const formatDocument = (doc: IDocument): IDocumentDto => {
 const {metadata, files, group, id, createdAt} = doc
    return {
        id: id,
        metadata: {...metadata, createdAt: createdAt},
        versions: formatVersions(group),
        files: formatFiles(files)
    }
}


export const formatVersions =(group: IDocumentGroup): IDocumentVersionDto[] =>{
   return  group.versions.map(d => {
        return {
            documentId:  d.id,
            version: d.metadata.version,
            name: group.title
        }
    })
}
export const formatFiles = (files: IDocumentFile[]): IFile[] =>{
return files.map(f => {
    return {...f.file , documentId: f.documentId}
})
}
