// src/services/socket.js
import { io } from 'socket.io-client';

// Use a single socket instance throughout the app
const socket = io('http://localhost:5000'); // Your backend URL

export default socket;