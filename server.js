const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const map = new Map();

io.on('connection', (socket) => {
  console.log('A user connected with id: ', socket.id);
  console.log(map,"map conncted");
  socket.on('join-room', (data) => {
    console.log(`${socket.id} with peerId: ${data.peerId} joined room: ${data.roomId}`);
    socket.join(data.roomId);
    map.set(data.roomId, data.peerId);
    console.log(map,"map");
    socket.broadcast.to(data.roomId).emit('user-joined', { peerId: data.peerId });
  });

  
  socket.on('disconnect', () => {
    console.log('User disconnected with id: ', socket.id);
  });
});

console.log(map);
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
