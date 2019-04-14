console.log('\n\n\n=================================');
const morgan = require('morgan');
const bodyParser = require('body-parser');

// EXPRESS
const express = require('express');
const app = express();

// HTTP Server
const server = require('http').createServer(app);
// Socket.io
var io = require('socket.io')(server);

// Errors
process.on('uncaughtException', function(err) {
    console.log('Caught exception: ' + err);
});

process.on('unhandledRejection', (reason, p) => {
    console.log('Unhandled Rejection at:', p, 'reason:', reason);
});

// Logger
app.use(morgan('common'));

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({
    extended: false
}));

// parse application/json
app.use(bodyParser.json());

// CORS
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});


// API
app.post('/namespaces', (req, res) => {
    console.log('req.body', req.body);

    const { name, host, port } = req.body;

    // ADD ID
    const namespaceJSON = {
        id: 'namespace-00001',
        name: name,
        host: host,
        port: port
    }

    res.status(201).json(namespaceJSON);
});


app.post('/rooms', (req, res) => {
    console.log('req.body', req.body);

    const { name, idNS } = req.body;

    // ADD ID
    const roomJSON = {
        id: 'room-00001',
        name: name,
        idNS: idNS
    };

    res.status(201).json(roomJSON);
});

app.get('/namespaces', (req, res) => {
    // NAMESPACES
    let namespaces = [{
        id: 'community-html',
        name: 'Community HTML',
        host: '127.0.0.1',
        port: 9090
    }, {
        id: 'community-css',
        name: 'Community CSS',
        host: '127.0.0.1',
        port: 9090
    }, {
        id: 'community-js',
        name: 'Community JS',
        host: '127.0.0.1',
        port: 9090
    }];

    res.json(namespaces);
});

app.get('/namespaces/:id', (req, res) => {

    let namespace = {};

    const idNS = req.params.id;

    switch (idNS) {
        case 'community-html':
            namespace = {
                id: 'community-html',
                name: 'Community HTML',
                host: '127.0.0.1',
                port: 9090
            };
            break;

        case 'community-css':
            namespace = {
                id: 'community-css',
                name: 'Community CSS',
                host: '127.0.0.1',
                port: 9090
            };
            break;

        case 'community-js':
            namespace = {
                id: 'community-js',
                name: 'Community JS',
                host: '127.0.0.1',
                port: 9090
            };
            break;
    }

    console.log('namespace', namespace);

    res.json(namespace);
});

app.get('/namespaces/:id/rooms', (req, res) => {

    const namespace = req.params.id;
    // console.log('namespace:', namespace);

    let roomsByNamespace = [];

    if (namespace !== null || namespace !== undefined) {
        roomsByNamespace = getRoomsByNamespace(namespace);
    }

    res.json(roomsByNamespace);
});

app.get('/rooms/:id/messages', (req, res) => {

    // Parameters
    const room = req.params.id;
    // console.log('room:', room);

    let messagesByRoom = getMessagesByRoom(room);
    //console.log('\nmessagesByRoom', messagesByRoom);

    res.json(messagesByRoom);
});

// NAMESPACE #1: '/community-css'
const nameNSP_CSS = 'community-css';
var nspCSS = io.of(`/${nameNSP_CSS}`);
nspCSS.on('connection', function(socket) {

    console.log(`Connection to ${nameNSP_CSS} namespace ...`);

    // 1. Socket.io EMIT
    socketEmitters(socket, nameNSP_CSS);
    // 2. Socket.io LISTENER
    socketListeners(socket, nameNSP_CSS);
});

// NAMESPACE #2: '/community-html'
const nameNSP_HTML = 'community-html';
var nspHTML = io.of(`/${nameNSP_HTML}`);
nspHTML.on('connection', function(socket) {
    console.log(`Connection to ${nameNSP_HTML} namespace ...`);

    // 1. Socket.io EMIT
    socketEmitters(socket, nameNSP_HTML);
    // 2. Socket.io LISTENER
    socketListeners(socket, nameNSP_HTML);
});

// JS Functions
function socketEmitters(socket, idNSP) {
    // console.log('socketEmitters - idNSP', idNSP);

    const roomsByNamespace = getRoomsByNamespace(idNSP);
    // console.log('roomsByNamespace', roomsByNamespace);

    socket.emit('hi', roomsByNamespace);

    socket.join('html5', () => {
        // let rooms = Object.keys(socket.rooms);
        // console.log(rooms); // [ <socket.id>, 'room 237' ]
        io.to('html5').emit('a new user has joined the room'); // broadcast to everyone in the room
    });
}

function socketListeners(socket, nameNSP) {
    // console.log('socketListeners - nameNSP', nameNSP);

    // Socket #1
    socket.on('hi-rooms', (namespace) => {
        // console.log('namespace', namespace);

        // ROOMS
        const rooms = getRoomsByNamespace(namespace);
        // console.log('\nrooms', rooms);

        // EMIT
        socket.emit('hi-rooms', rooms);
    });

    // Socket #2
    socket.on('get-list-rooms', (idNS) => {
        // console.log('idNS', idNS);

        // ROOMS
        const rooms = getRoomsByNamespace(idNS);
        // console.log('\nrooms', rooms);

        // EMIT
        socket.emit('get-list-rooms', rooms);
    });

    // Socket #3:
    socket.on('join-room', (idRoom) => {

        socket.join(idRoom, () => {
            let rooms = Object.keys(socket.rooms);
            //console.log('rooms', rooms);

            const messages = getMessagesByRoom(idRoom);
            //console.log(messages);

            // sending to all clients except sender
            socket.emit('get-messages', messages);
        });
    });

    // Socket #4
    socket.on('send-message', (message) => {
        // console.log(`Sending a message ${JSON.stringify(message)}`);
        socket.broadcast.emit('receive-message', message);
    });
}

function getMessagesByRoom(idRoom) {
    //console.log('idRoom', idRoom);

    let messagesByRoom = [];

    if (idRoom !== null || idRoom !== undefined) {

        switch (idRoom) {
            case 'html5':
                messagesByRoom = [{
                    id: 11,
                    username: '[html5]0001',
                    text: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industrys standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.',
                    idRoom: idRoom

                }, {
                    id: 12,
                    username: '[html5]0002',
                    text: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industrys standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.',
                    idRoom: idRoom

                }, {
                    id: 13,
                    username: '[html5]0003',
                    text: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industrys standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.',
                    idRoom: idRoom

                }, {
                    id: 14,
                    username: '[html5]0004',
                    text: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industrys standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.',
                    idRoom: idRoom

                }];
                break;
            case 'qa':
                messagesByRoom = [{
                    id: 21,
                    username: '[qa]0001',
                    text: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industrys standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.',
                    idRoom: idRoom

                }, {
                    id: 22,
                    username: '[qa]0002',
                    text: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industrys standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.',
                    idRoom: idRoom

                }];
                break;
            case 'css':
                messagesByRoom = [{
                    id: 31,
                    username: '[css]0001',
                    text: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industrys standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.',
                    idRoom: idRoom

                }, {
                    id: 32,
                    username: '[css]0002',
                    text: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industrys standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.',
                    idRoom: idRoom

                }, {
                    id: 33,
                    username: '[css]0003',
                    text: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industrys standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.',
                    idRoom: idRoom

                }, {
                    id: 34,
                    username: '[css]0004',
                    text: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industrys standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.',
                    idRoom: idRoom

                }, {
                    id: 35,
                    username: '[css]0005s',
                    text: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industrys standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.',
                    idRoom: idRoom

                }];
                break;
        }
    }

    return messagesByRoom;
}

function getRoomsByNamespace(idNS) {
    // console.log('idNS', idNS);

    let roomsByNamespace = [];

    if (idNS !== null || idNS !== undefined) {
        switch (idNS) {
            case 'community-html':
                roomsByNamespace = [{
                    id: 'html5',
                    name: 'HTML 5',
                    idNS: idNS
                }, {
                    id: 'qa',
                    name: 'Questions and Answers',
                    idNS: idNS
                }];
                break;
            case 'community-css':
                roomsByNamespace = [{
                    id: 'css',
                    name: 'CSS',
                    idNS: idNS
                }, {
                    id: 'css3',
                    name: 'CSS 3',
                    idNS: idNS
                }, {
                    id: 'qa',
                    name: 'Questions and Answers',
                    idNS: idNS
                }];
                break;
            case 'community-js':
                roomsByNamespace = [{
                    id: 'react',
                    name: 'React.js',
                    idNS: idNS
                }, {
                    id: 'vue',
                    name: 'Vue.js',
                    idNS: idNS
                }, {
                    id: 'angular',
                    name: 'Angular.js',
                    idNS: idNS
                }];
                break;
        }
    }

    return roomsByNamespace;
}


// 👉👉 Configuration Server
const host = '127.0.0.1';
const port = process.env.PORT || 9090;
server.listen(port, host, function() {
    console.log(`Server Socket.io is running at http://${host}:${port}`);
});