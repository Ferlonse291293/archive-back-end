import type {IDocumentRef, IDocumentTree, IFolderDocument} from "./documents.types.js";

const addDocuments = (documentsRef: IDocumentRef[] , id: string)  => {
    const docForFolder = documentsRef.filter(el => el.folderId === id)
    if(docForFolder.length === 0){
        return []
    }
    return  docForFolder.map(el => {
        return {
            content: el,
            type: 'DOCUMENT',
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
