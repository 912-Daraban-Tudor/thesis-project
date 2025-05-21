// client-cra/src/api/socket.js
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000', {
    autoConnect: false,
    auth: {
        token: localStorage.getItem('token'), // JWT stored on login
    },
});

export default socket;
