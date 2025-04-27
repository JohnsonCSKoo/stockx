import axios from 'axios';
import {OrderRequest, OrderResponse} from "@/@types/order";
import {getToken} from "@/lib/actions";

const API_URL = 'http://localhost:8080/api/v1/orders';

export const placeOrder = async (orderData: OrderRequest) =>
axios.post<OrderRequest, { data: OrderResponse }>(`${API_URL}`, orderData, {
    headers: {
        Authorization: `Bearer ${await getToken()}`
    }});