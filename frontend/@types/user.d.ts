export interface CreateUserRequest {
    username: string;
}

export interface UserResponse {
    id: number;
    username: string;
    sessionId: string;
}