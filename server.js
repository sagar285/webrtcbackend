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

// Map to store users in each room
const rooms = new Map();

io.on('connection', (socket) => {
  console.log('A user connected with id: ', socket.id);

  socket.on('join-room', (data) => {
    console.log(`${socket.id} with peerId: ${data.peerId} joined room: ${data.roomId}`);
    socket.join(data.roomId);

    // Add the user to the room
    if (!rooms.has(data.roomId)) {
      rooms.set(data.roomId, []);
    }
    rooms.get(data.roomId).push({ peerId: data.peerId, socketId: socket.id });

    // Notify the existing users in the room about the new user
    socket.broadcast.to(data.roomId).emit('user-joined', { peerId: data.peerId });

    // Send existing users' peerIds to the new user
    const existingUsers = rooms.get(data.roomId).filter(user => user.peerId !== data.peerId);
    socket.emit('existing-users', existingUsers.map(user => user.peerId));
  });

  socket.on('toggle-audio', (data) => {
    console.log(`Audio toggled by ${data.peerId} in room ${data.roomId}: ${data.audioEnabled}`);
    socket.broadcast.to(data.roomId).emit('toggle-audio', data);
  });

  socket.on('toggle-video', (data) => {
    console.log(`Video toggled by ${data.peerId} in room ${data.roomId}: ${data.videoEnabled}`);
    socket.broadcast.to(data.roomId).emit('toggle-video', data);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected with id: ', socket.id);

    // Remove user from the rooms map
    rooms.forEach((users, roomId) => {
      const updatedUsers = users.filter(user => user.socketId !== socket.id);
      rooms.set(roomId, updatedUsers);
    });

    console.log(rooms, 'updated rooms after disconnect');
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
