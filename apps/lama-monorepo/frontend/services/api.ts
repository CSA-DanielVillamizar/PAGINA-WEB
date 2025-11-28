import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080/api';

export const apiClient = axios.create({ baseURL: API_BASE_URL });

export const authService = {
  async register(data: { nombreCompleto: string; correo: string; nombreUsuario: string; password: string }) {
    const res = await apiClient.post('/auth/registro', data);
    return res.data;
  },
  async login(data: { correo?: string; nombreUsuario?: string; password: string }) {
    const res = await apiClient.post('/auth/login', data);
    return res.data.data; // { access, refresh }
  },
  async refresh(refresh: string) {
    const res = await apiClient.post('/auth/refresh', { refresh });
    return res.data.data; // { access }
  },
};
