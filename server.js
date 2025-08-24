const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

app.use(express.static(__dirname));
const players = {};

io.on('connection', (socket) => {
    players[socket.id] = { x: 400, y: 300 };
    socket.emit('players', players);
    socket.broadcast.emit('players', {[socket.id]: players[socket.id]});
    
    socket.on('move', (pos) => {
        players[socket.id] = pos;
        socket.broadcast.emit('playerMoved', {id: socket.id, ...pos});
    });
    
    socket.on('disconnect', () => {
        delete players[socket.id];
        io.emit('playerLeft', socket.id);
    });
});

http.listen(3000, () => console.log('Server running on port 3000'));
