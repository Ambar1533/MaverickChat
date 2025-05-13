/**React App\src\utils\chatSocketServer.js */

// React App\src\utils\chatSocketServer.js

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

  // Connecting to Socket Server
  establishSocketConnection(userId) {
    try {
      this.socket = io(SOCKET_URL, {
        query: `userId=${userId}`
      });
    } catch (error) {
      alert(`Something went wrong; Can't connect to socket server`);
    }
  }

  getChatList(userId) {
    this.socket.emit(CHAT_LIST, { userId });
    this.socket.on(CHAT_LIST_RESPONSE, (data) => {
      this.eventEmitter.emit(CHAT_LIST_RESPONSE, data);
    });
  }

  typing(data) {
    this.socket.emit('typing', data);
  }

  stopTyping(data) {
      this.socket.emit('stopTyping', data);
  }

  sendMessage(message) {
    this.socket.emit(ADD_MESSAGE, message);
  }

  sendMessageRead(data) {
    this.socket.emit('message-read', data);
  }

  receiveMessage() {
    this.socket.on(ADD_MESSAGE_RESPONSE, (data) => {
      this.eventEmitter.emit(ADD_MESSAGE_RESPONSE, data);
    });
  }

  logout(userId) {
    this.socket.emit(LOGOUT, userId);
    this.socket.on(LOGOUT_RESPONSE, (data) => {
      this.eventEmitter.emit(LOGOUT_RESPONSE, data);
    });
  }
}

const instance = new ChatSocketServer();
export default instance;
