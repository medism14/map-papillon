import axios from 'axios';

const api = axios.create({
  baseURL: 'https://daviddurand.info/D228/papillons',
  withCredentials: true
});

export default api;