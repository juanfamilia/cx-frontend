import { User } from './user';

export interface Login {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  user: User;
}
