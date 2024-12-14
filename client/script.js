const socket = io();

const messaging = (msgsArea,name,msg) => {
    const item = document.createElement("li");
    item.textContent = `${name} : ${msg}`;
    msgsArea.appendChild(item);
    window.scrollTo(0,document.body.scrollHeight);
}

const displayConnectionStatus = (nickName) => {
    const connectionStatus = document.getElementById("connectionStatus");
    connectionStatus.innerText = `Hello ${nickName} you connected successfully!`;
}

socket.on("connect",() => {
    socket.nickName = prompt("What is your name?");
    displayConnectionStatus(socket.nickName);
    socket.emit("new user",socket.nickName);

    console.log(`A user connected with id: ${socket.id}`);

    const messages = document.getElementById("messages");
    const form = document.getElementById("grpMsgForm");
    const input = document.getElementById("grpMsgInput");


    // form submit event listener
    form.addEventListener("submit", (evt) => {
        evt.preventDefault();

        if (input.value.trim() !== "") {
            const msg = input.value;
            messaging(messages,"Me",msg);
            socket.emit("group message",socket.nickName,msg)
            input.value = "";
        }

    })


    input.addEventListener("input", () => {
        socket.emit("userIsTyping",socket.nickName);
    })

    input.addEventListener("change", () => {
        socket.emit("userIsNotTyping")
    })

    socket.on("new user", (nickName) => {
        alert(`${nickName} has joined the chat!`);
    });

    socket.on("userIsTyping", (nickName) => {
        const typing = document.getElementById("typing");
        typing.innerText = `${nickName} is typing...`;
    });

    socket.on("group message", (nickName,msg) => {
        messaging(messages,nickName,msg)
    });

    socket.on("usersList", (users) => {
        const connectedUsers = document.getElementById("connectedUsers");
        connectedUsers.innerHTML = "";
        for (const id in users) {
            const nickName = users[id];
            const user = document.createElement("li");
            user.innerText = `${nickName}`;
            connectedUsers.appendChild(user);
        }
    })

    socket.on("userIsNotTyping", () => {
        const typing = document.getElementById("typing");
        typing.innerText = "";
    })

    socket.on("user left", nickName => {
        alert(`${nickName} has left the chat!`);
    });
});



