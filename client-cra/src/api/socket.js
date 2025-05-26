// client-cra/src/api/socket.js
import { io } from 'socket.io-client';

const socket = io(process.env.REACT_APP_BACKEND_URL, {
    autoConnect: false,
    auth: {
        token: localStorage.getItem('token'), // JWT stored on login
    },
});

export default socket;
