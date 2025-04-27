export interface PagedRequest {
    page: number;
    size: number;
    sortBy: string;
    direction: 'asc' | 'desc';
    filter: string | undefined;
}