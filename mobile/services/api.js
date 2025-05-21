import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api', // replace with LAN IP for real device testing
});

export const getQuests = () => API.get('/quests');
export const completeTask = (task) =>
  API.post('/complete', { task: task.title, completed: true });
