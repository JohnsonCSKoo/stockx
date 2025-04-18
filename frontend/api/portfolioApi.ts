import axios from 'axios';
import {PortfolioResponse} from "@/@types/portfolio";

const API_URL = 'http://localhost:8080/api/v1/portfolios';

export const getUserPortfolio = async (sessionId: string) =>
    await axios.get<{ data: PortfolioResponse }>(`${API_URL}/${sessionId}`);