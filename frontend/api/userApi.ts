import axios from 'axios';
import {CreateUserRequest, UserResponse} from "@/@types/user";

const API_URL = 'http://localhost:8080/api/v1/users';

export const createUser = async (userData: CreateUserRequest) =>
    axios.post<CreateUserRequest, { data: UserResponse }>(`${API_URL}/create`, userData);
