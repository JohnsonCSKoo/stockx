export interface CreateUserRequest {
    username: string;
}

export interface UserResponse {
    id: number;
    username: string;
    token: string;
    expiresAt: Date;
}