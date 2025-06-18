// server/server.js
const express = require('express');
const path = require('path');
const http = require('http');
const { Server } = require("socket.io");
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000", // Your React app's address
        methods: ["GET", "POST"]
    }
});

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/documentation', require('./routes/documentation'));
app.use('/api/users', require('./routes/users'));

// **** THIS IS THE LIKELY MISSING LINE ****
app.use('/api/chat', require('./routes/chat'));
// *****************************************

// Socket.IO connection
require('./socket')(io);


const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));