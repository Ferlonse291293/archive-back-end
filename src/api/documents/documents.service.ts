
import type {IDocumentDto, IDocumentRef} from "./documents.types.js";
import {buildTree, formatDocument} from "./documents.utils.js";
import {PrismaPg} from "@prisma/adapter-pg";
import {PrismaClient} from "@prisma/client";



const adapter = new PrismaPg({
    connectionString: String(process.env.DATABASE_URL)
})
const prisma = new PrismaClient({ adapter });





export const getDocumentTreeService = async (clientId: string) => {
    const folders = await prisma.folder.findMany();
    if (!folders.length) return null;

    const documentGroups = await prisma.documentGroup.findMany({
        where: { clientId },
        select: {
            folderId: true,
            title: true,
            currentVersion: {
                select: {
                    id: true,
                    createdAt: true,
                    updatedAt: true,
                    metadata: { select: { version: true } },
                },
            },
        },
    });

    const documentsRef: IDocumentRef[] = documentGroups
        .filter((g) => g.currentVersion)
        .map((g) => ({
            id: g.currentVersion!.id,
            folderId: g.folderId,
            version: g.currentVersion!.metadata.version,
            name: g.title,
            dateCreated: g.currentVersion!.createdAt.getTime(),
            dateUpdate: g.currentVersion!.updatedAt.getTime(),
        }));

    return buildTree(folders, documentsRef);
};

export const getDocumentByIdService = async (documentId: string):Promise<IDocumentDto | null> => {

    if(!documentId) {
        return null
    }

   let document = await prisma.document.findUnique({
        where: { id: documentId },
        include: {
            files: { include: { file: true } },
            metadata: true,
            group: {
                include: {
                    versions: {
                        include: {
                            metadata: true,
                        }},
                },
            }
        },
    });

    if(!document) {
        return null
    }
    return formatDocument(document)
};
//
