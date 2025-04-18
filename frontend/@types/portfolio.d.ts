import { PositionDto } from './position';

export interface PortfolioResponse {
    id: number;
    balance: number;
    positions: PositionDto[];
}