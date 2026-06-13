import fs from 'fs';
import type {IClient} from "./clients.types.js";
import {PAGINATION_SORT} from "../../shared/const/pagination.js";
import {formatResClient} from "./clients.utils.js";
import {TypeClient} from "./clients.types.js";


const clientsDb = JSON.parse(
    fs.readFileSync('./src/db/clients.json', 'utf-8')
);


export const getClientsService =
    async (page: number, limit: number, sort: PAGINATION_SORT) => {

        const clients = [...clientsDb];

        if (clients.length === 0) {
            return {
                meta: {
                    page,
                    pageSize: 0,
                    totalItems: 0,
                    totalPages: 0,
                    hasNextPage: false,
                    hasPrevPage: false,
                },
                data: []
            };
        }

        const totalItems = clients.length;
        const totalPages = Math.ceil(totalItems / limit);

        const start = (page - 1) * limit;
        const end = start + limit;

        let data = clients.slice(start, end);
        data = [...formatResClient(data, TypeClient.INDIVIDUALS)]

        return {
            meta: {
                page,
                pageSize: data.length,
                totalItems,
                totalPages,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1,
            },
            data
        };
    };

export const getClientService =
    async (clientId: string) => {
        const client:  IClient   = [...clientsDb].find(el => el.clientId === clientId)
        if (!client) return null;
        return client
    };
