const express = require('express');
const app = express();
const http = require("http");
const server = http.createServer(app);
const {Server} = require('socket.io');
const port = 3000;
const io = new Server(server);

// all of our static folders are in client folder.
app.use(express.static("client"));

let connectedUsers = {};

io.on("connection", (socket) => {
    console.log(`A user connected with id: ${socket.id}`);

    // broadcasting to everyone except the connected user.
    socket.on("new user", (nickName) => {
        socket.nickName = nickName;
        connectedUsers[socket.id] = nickName;
        console.log(`Connnected users `,connectedUsers);
        console.log(`A new user connected with nickName ${nickName} and ${socket.id}`);
        socket.broadcast.emit("new user", nickName);
        io.emit("usersList", connectedUsers);
    })

    socket.on("group message", (nickName,msg) => {
        console.log(msg)
        // socket io automatically detects that the sender of message is the same!
        socket.broadcast.emit("group message",nickName, msg);
    })

    socket.on("userIsTyping", (nickName) => {
        socket.broadcast.emit("userIsTyping",nickName);
    });

    socket.on("userIsNotTyping", () => {
        socket.broadcast.emit("userIsNotTyping");
    })

    socket.on("disconnect", () => {
        console.log(`A user disconnected with id: ${socket.id}`);
        socket.broadcast.emit("user left", socket.nickName);
        delete connectedUsers[socket.id];
        io.emit("usersList", connectedUsers);
        console.log(`Connected users `,connectedUsers);

    });

})

server.listen(port, () => {
    console.log(`Server listening on port ${port}`);
})