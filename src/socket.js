import { io } from 'socket.io-client';

const socket = io('http://localhost:4000'); // Use your deployed backend URL if needed
export default socket;
