import { io } from 'socket.io-client';
import { getToken } from './api';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:4000';

let socket = null;

export function getSocket() {
  if (!socket) {
    socket = io(SOCKET_URL, {
      auth: { token: getToken() },
      autoConnect: false,
    });
  }
  return socket;
}

export function connectSocket() {
  const s = getSocket();
  s.auth = { token: getToken() };
  if (!s.connected) s.connect();
  return s;
}

export function disconnectSocket() {
  if (socket?.connected) socket.disconnect();
}
