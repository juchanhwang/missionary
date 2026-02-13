import api from './instance';

export interface CreateUserDto {
  email: string;
  password: string;
  name?: string;
}

export const userApi = {
  create(data: CreateUserDto) {
    return api.post('/users', data);
  },
};
