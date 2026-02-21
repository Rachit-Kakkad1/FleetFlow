const { Server } = require('socket.io');

let io;

const initSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: process.env.CORS_ORIGIN || '*',
            methods: ['GET', 'POST']
        }
    });

    io.on('connection', (socket) => {
        console.log(`🔌 Client connected: ${socket.id}`);
        socket.on('disconnect', () => {
            console.log(`🔌 Client disconnected: ${socket.id}`);
        });
    });

    return io;
};

const getIo = () => {
    if (!io) {
        console.warn('Socket.io NOT initialized yet. Emitting events will fail silently.');
    }
    return io;
};

module.exports = { initSocket, getIo };
