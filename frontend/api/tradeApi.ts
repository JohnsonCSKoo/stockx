import axios from 'axios';
import {OrderRequest, OrderResponse} from "@/@types/order";
import {getToken} from "@/lib/actions";
import {PagedRequest} from "@/@types/common";

const API_URL = 'http://localhost:8080/api/v1/orders';

export const placeOrder = async (orderData: OrderRequest) =>
axios.post<OrderRequest, { data: OrderResponse }>(`${API_URL}`, orderData, {
    headers: {
        Authorization: `Bearer ${await getToken()}`
    }});

export const getOrders = async (searchParams: PagedRequest) =>
    axios.get<{ data: OrderResponse[] }>(`${API_URL}?page=${searchParams.page}&size=${searchParams.size}&sortBy=${searchParams.sortBy}&direction=${searchParams.direction}&filter=${searchParams.filter}`, {
        headers: {
            Authorization: `Bearer ${await getToken()}`
        }
    });