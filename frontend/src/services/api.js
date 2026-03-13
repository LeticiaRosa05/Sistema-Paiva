import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080' // Endereço do Spring Boot
});

// Funcionamento do LocalStorage
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  response => response, 
  error => {
    if (error.response && error.response.status === 403) {
      localStorage.removeItem('token');
      window.location.href = '/login'; // Expulsa para o login caso o login expire e o sistema devolva código 403
    }
    return Promise.reject(error);
  }
);

export default api;
