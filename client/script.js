const socket = io();
const usersTalkingPrivately = {}

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
        // make sure the list is empty. (to avoid duplication)
        connectedUsers.innerHTML = "";

        // looping over users list and add them to connected users list.
        for (const id in users) {
            const nickName = users[id];
            const user = document.createElement("li");
            user.innerText = `${nickName}`;
            connectedUsers.appendChild(user);
            const sendMsgBtn = document.createElement("button");
            sendMsgBtn.innerText = `Send Private Message to ${nickName}`;
            const cantSendMsg = document.createElement("span");
            cantSendMsg.innerText = `Can't send a message to yourself.`;
            if (id !== socket.id){
                connectedUsers.appendChild(sendMsgBtn);
            } else {
                connectedUsers.appendChild(cantSendMsg);
            }

            const privateMsg = document.getElementById("privateMsgs");
            sendMsgBtn.addEventListener("click", () => {
                if (!usersTalkingPrivately[id]){
                    usersTalkingPrivately[id] = nickName;
                    const privMsgArea = document.createElement("ul")
                    privMsgArea.id = id;
                    privMsgArea.classList.add("privMsg");
                    const privHeading = document.createElement("h1");
                    const input = document.createElement("input");
                    const sendBtn = document.createElement("button");
                    sendBtn.type = "submit";
                    sendBtn.innerText = `Send`;
                    privHeading.innerText = `Private Messages between you and ${nickName}`;
                    privMsgArea.appendChild(privHeading);
                    privMsgArea.appendChild(input);
                    privMsgArea.appendChild(sendBtn);
                    privateMsg.appendChild(privMsgArea);

                    sendBtn.onclick = (event) => {
                        event.preventDefault();
                        const msg = input.value;
                        // sender id , receiver id, sender nickname, the message
                        socket.emit("sendPrivateMsg", socket.id, id, socket.nickName,msg);
                        // if im talking to chandler it will be chandler id.
                        const msgArea = document.getElementById(id);
                        messaging(msgArea,"Me: ",msg);
                        input.value = "";
                    }

                } else {
                    alert(`You are already talking to ${nickName}`);
                }
            })
        }
    })

    socket.on("recPrivateMsg", (senderID,senderName,msg) => {
        const privateMsgs = document.getElementById("privateMsgs");
        // if the user is not already talking ,
        if (!usersTalkingPrivately[senderID]){
            usersTalkingPrivately[senderID] = senderName
            const privMsgArea = document.createElement('ul')
            privMsgArea.id = senderID
            privMsgArea.classList.add('privMsg')
            const privHeading = document.createElement('h1')
            const input = document.createElement('input')
            const sendBtn = document.createElement('button')
            sendBtn.type = 'submit'
            sendBtn.innerText = 'send'
            privHeading.innerText = `Private messages between you and ${senderName}`
            privMsgArea.appendChild(privHeading)
            privMsgArea.appendChild(input)
            privMsgArea.appendChild(sendBtn)
            privateMsgs.appendChild(privMsgArea)
            messaging(privMsgArea, senderName, msg)
            sendBtn.onclick = (e) => {
                e.preventDefault()
                const msg = input.value
                const msgArea = document.getElementById(senderID)
                messaging(msgArea, 'Me: ', msg)
                socket.emit('sendPrivateMsg', socket.id, senderID, socket.nickName, msg)
                input.value = ''
            }
        } else {
            const msgArea = document.getElementById(senderID);
            messaging(msgArea,senderName,msg);
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



