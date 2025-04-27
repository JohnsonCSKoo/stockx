export interface PositionDto {
    positionId: number;
    stockId: number;
    stockName: string;
    stockSymbol: string;
    quantity: number;
    averagePrice: number;
    currentPrice: number;
    totalValue: number;
}