import fs from 'fs';
import { Prisma } from "@prisma/client";
import {PAGINATION_SORT} from "../../shared/const/pagination.js";

import type {
    IClientIndividualDetail,
    IClientIndividualListItem,
    IClientIndividualsFilter
} from "./clients.types.js";
import {PrismaPg} from "@prisma/adapter-pg";
import {PrismaClient} from "@prisma/client";
import {flattenClient, formatClientToItem} from "./clients.utils.js";

const adapter = new PrismaPg({
    connectionString: String(process.env.DATABASE_URL)
})
const prisma = new PrismaClient({ adapter });

export const getIndividualClientsService = async (
    page: number,
    limit: number,
    sort: PAGINATION_SORT,
    search: IClientIndividualsFilter
): Promise<IClientIndividualListItem[] | null>  => {

    const safePage = Math.max(0, page);

    if (search.ipn || search.code) {
        const client = await prisma.client.findFirst({
            where: {
                typeClient: "INDIVIDUALS",
                AND: [
                    search.ipn  ? { individual: { ipn: search.ipn } } : undefined,
                    search.code ? { code: search.code } : undefined,
                ].filter(Boolean) as Prisma.ClientWhereInput[]
            },

            include: { individual: true }
        });

        if (!client || !client.individual) {
            return null;
        }
        return {
            meta: {
                page: 1,
                pageSize: 1,
                totalItems: 1,
                totalPages: 1,
                hasNextPage: false,
                hasPrevPage: false,
            },
            data:   [formatClientToItem(flattenClient(client))]
        };
    }


    const where: Prisma.ClientWhereInput = {
        typeClient: "INDIVIDUALS",
        AND: [
            search.firstName ? { individual: { firstName: { contains: search.firstName, mode: 'insensitive' as const } } } : undefined,
            search.lastName  ? { individual: { lastName:  { contains: search.lastName,  mode: 'insensitive' as const } } } : undefined,
        ].filter(Boolean) as Prisma.ClientWhereInput[]
    };

    const [totalItems, clients] = await Promise.all([
        prisma.client.count({ where }),
        prisma.client.findMany({
            where,
            include: {
                individual: {
                    include: {
                        department: { select: { address: true, code: true } },
                    },
                },
            },
            skip: safePage * limit,
            take: limit,
            orderBy: { createdAt: sort === PAGINATION_SORT.ASC ? 'asc' : 'desc' }
        })
    ]);

    const totalPages = Math.ceil(totalItems / limit);
    const data = clients.map(client => formatClientToItem(flattenClient(client)));

    return {
        meta: {
            page: safePage ,
            pageSize: data.length,
            totalItems,
            totalPages,
            hasNextPage: safePage < totalPages - 1,
            hasPrevPage: safePage > 0,
        },
        data
    };
};

export const getIndividualClientService =
    async (clientId: string) : Promise<IClientIndividualDetail | null> => {
        const client = await prisma.client.findUnique({
            where: {
                id: clientId
            },
            include: {
                individual: {
                    include: {
                        department: { select: { address: true, code: true } },
                    },
                },
            }
        });
        if (!client) return null;
        return flattenClient(client);
    };
