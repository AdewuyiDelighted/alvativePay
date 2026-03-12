import http from 'http';
import express from 'express';
import {Server} from "socket.io";

const app = express();
const server = http.createServer(app);
export const io = new Server(server); 

io.on('connection', (socket) => {
  console.log('New client connected');
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

server.listen(process.env.SOCKET_PORT, () => {
  console.log(`Socket Server running on port ${process.env.SOCKET_PORT}`);
});