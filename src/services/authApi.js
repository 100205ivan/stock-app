import axios from 'axios';

// ⚠️ 把這裡換成你剛剛從 ngrok 複製的網址 (不要有結尾的斜線 /)
const API_URL = 'https://e29712957e36.ngrok-free.app'; 

export const login = async (email, password) => {
  try {
    // 這裡會變成 https://xxxx.ngrok-free.app/login
    const response = await axios.post(`${API_URL}/login`, { email, password });
    return response.data;
  } catch (error) {
    console.error('Login error:', error); // 加個 log 方便除錯
    throw error.response?.data?.error || '連線失敗';
  }
};

export const register = async (name, email, password) => {
  try {
    const response = await axios.post(`${API_URL}/register`, { name, email, password });
    return response.data;
  } catch (error) {
    console.error('Register error:', error);
    throw error.response?.data?.error || '連線失敗';
  }
};