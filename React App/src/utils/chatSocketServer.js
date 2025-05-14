// React App/src/utils/chatSocketServer.js

import { io } from 'socket.io-client';
import { EventEmitter } from 'events';
import {
  CHAT_LIST,
  CHAT_LIST_RESPONSE,
  ADD_MESSAGE,
  ADD_MESSAGE_RESPONSE,
  LOGOUT,
  LOGOUT_RESPONSE
} from '../constants/socketEvents';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL;

class ChatSocketServer {
  socket = null;
  eventEmitter = new EventEmitter();

  // ✅ Establish a new socket connection
  establishSocketConnection(userId) {
    try {
      this.socket = io(SOCKET_URL, {
        query: `userId=${userId}`,
        transports: ['websocket'], // Optional but ensures reliable transport
      });

      this.socket.on('connect', () => {
        console.log('🟢 Socket connected:', this.socket.id);
      });

      this.socket.on('disconnect', () => {
        console.warn('🔌 Socket disconnected');
      });

      this.socket.on('connect_error', (err) => {
        console.error('❌ Socket connection error:', err.message);
      });
    } catch (error) {
      alert(`Something went wrong: Can't connect to socket server`);
    }
  }

  // 🔄 Request chat list
  getChatList(userId) {
    if (!this.socket) return;
    this.socket.emit(CHAT_LIST, { userId });
    this.socket.on(CHAT_LIST_RESPONSE, (data) => {
      this.eventEmitter.emit(CHAT_LIST_RESPONSE, data);
    });
  }

  // ⌨️ Typing indicators
  typing(data) {
    if (!this.socket) return;
    this.socket.emit('typing', data);
  }

  stopTyping(data) {
    if (!this.socket) return;
    this.socket.emit('stopTyping', data);
  }

  // 📤 Send message
  sendMessage(message) {
    if (!this.socket) return;
    this.socket.emit(ADD_MESSAGE, message);
  }

  // ✅ Mark message as read
  sendMessageRead(data) {
    if (!this.socket) return;
    this.socket.emit('message-read', data);
  }

  // 📥 Listen for incoming messages
  receiveMessage() {
    if (!this.socket) return;
    this.socket.on(ADD_MESSAGE_RESPONSE, (data) => {
      this.eventEmitter.emit(ADD_MESSAGE_RESPONSE, data);
    });
  }

  // 🚪 Logout
  logout(userId) {
    if (!this.socket) return;
    this.socket.emit(LOGOUT, userId);
    this.socket.on(LOGOUT_RESPONSE, (data) => {
      this.eventEmitter.emit(LOGOUT_RESPONSE, data);
    });
  }
}

const instance = new ChatSocketServer();
export default instance;
