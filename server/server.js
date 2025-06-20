// server/server.js
require('dotenv').config();

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

// Serve the static files from the React app
app.use(express.static(path.join(__dirname, '../client/build')));

// Add io to the request object so it can be accessed in controllers
app.use((req, res, next) => {
    req.io = io;
    next();
});

// Serve static assets from the 'public' directory
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));
app.use(express.static(path.join(__dirname, 'public')));


// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/documentation', require('./routes/documentation'));
app.use('/api/users', require('./routes/users'));
app.use('/api/chat', require('./routes/chat'));

// Socket.IO connection
require('./socket')(io);

const PORT = process.env.PORT || 80;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));