import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const server = createServer(app);
const io = new Server(server);

app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(join(__dirname, 'public', 'index.html'));
});

const users = new Map();

io.on('connection', (socket) => {
  console.log('User connected');

  socket.on('user join', (username) => {
    users.set(socket.id, username);
    io.emit('user joined', username);
    io.emit('active users', Array.from(users.values()));
  });

  socket.on('chat message', (msg) => {
    const username = users.get(socket.id);
    io.emit('chat message', { username, message: msg });
  });

  socket.on('typing', () => {
    const username = users.get(socket.id);
    socket.broadcast.emit('user typing', username);
  });

  socket.on('disconnect', () => {
    const username = users.get(socket.id);
    users.delete(socket.id);
    io.emit('user left', username);
    io.emit('active users', Array.from(users.values()));
  });
});

server.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});