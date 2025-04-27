export interface OrderRequest {
    symbol: string;
    quantity: number;
    limitPrice: number;
    direction: OrderDirection;
    type: OrderType;
}

export interface OrderResponse {
    id: number;
    symbol: string;
    quantity: number;
    limitPrice: number;
    executedPrice: number;
    status: OrderStatus;
    type: OrderType;
    direction: OrderDirection;
    createdAt: Date;
    executedAt: Date;
}

export const enum OrderDirection {
    BUY = 'BUY',
    SELL = 'SELL',
}

export const enum OrderType {
    MARKET = 'MARKET',
    LIMIT = 'LIMIT',
}

export const enum OrderStatus {
    PENDING = 'PENDING',
    COMPLETED = 'COMPLETED',
    CANCELLED = 'CANCELLED',
    FAILED = 'FAILED',
}