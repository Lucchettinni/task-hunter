// src/services/socket.js
import { io } from 'socket.io-client';

// Use a single socket instance throughout the app
const socket = io(); // Connects to the host that serves the page

export default socket;