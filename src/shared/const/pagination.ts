export const PAGINATION_SORT = {
    ASC: 'asc',
    DESC: 'desc'
} as const;
export type PAGINATION_SORT = typeof PAGINATION_SORT[keyof typeof PAGINATION_SORT];

export const PAGINATION_DEFAULT_CONFIG = {
    limit: 10,
    sort: PAGINATION_SORT.ASC
}
