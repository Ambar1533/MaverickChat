/** Nodejs API\web\socket.js */
'use strict';

const queryHandler = require('./../handlers/query-handler');
const CONSTANTS = require('./../config/constants');

class Socket {
  constructor(socket) {
    this.io = socket;
  }

  socketEvents() {
    this.io.on('connection', (socket) => {
      console.log(`🔌 User connected: ${socket.id}`);

      // Chat list event
      socket.on('chat-list', async (data) => {
        if (!data.userId) {
          this.io.emit('chat-list-response', {
            error: true,
            message: CONSTANTS.USER_NOT_FOUND
          });
        } else {
          try {
            const [UserInfoResponse, chatlistResponse] = await Promise.all([
              queryHandler.getUserInfo({ userId: data.userId, socketId: false }),
              queryHandler.getChatList(socket.id)
            ]);
            this.io.to(socket.id).emit('chat-list-response', {
              error: false,
              singleUser: false,
              chatList: chatlistResponse
            });
            socket.broadcast.emit('chat-list-response', {
              error: false,
              singleUser: true,
              chatList: UserInfoResponse
            });
          } catch (error) {
            console.error('❌ chat-list error:', error);
            this.io.to(socket.id).emit('chat-list-response', {
              error: true,
              chatList: []
            });
          }
        }
      });

      // Add message event
      socket.on('add-message', async (data) => {
        console.log('📩 add-message received:', data);

        if (!data.message || !data.fromUserId || !data.toUserId) {
          const missingField = !data.message
            ? CONSTANTS.MESSAGE_NOT_FOUND
            : !data.fromUserId
            ? CONSTANTS.SERVER_ERROR_MESSAGE
            : CONSTANTS.SELECT_USER;

          return this.io.to(socket.id).emit('add-message-response', {
            error: true,
            message: missingField
          });
        }

        try {
          data.read = false;
          data.timestamp = new Date();

          const [toSocketId, insertedId] = await Promise.all([
            queryHandler.getUserInfo({ userId: data.toUserId, socketId: true }),
            queryHandler.insertMessages(data)
          ]);

          if (!insertedId) {
            throw new Error('Message insert failed.');
          }

          console.log(`✅ Message inserted: ${insertedId}`);
          console.log(`📤 Sending to user socket: ${toSocketId}`);

          this.io.to(toSocketId).emit('add-message-response', data);
        } catch (error) {
          console.error('❌ Error in add-message:', error);
          this.io.to(socket.id).emit('add-message-response', {
            error: true,
            message: CONSTANTS.MESSAGE_STORE_ERROR
          });
        }
      });

      // Typing events
      socket.on('typing', (data) => {
        socket.broadcast.emit('typing', {
          fromUserId: data.fromUserId,
          toUserId: data.toUserId,
          username: data.username
        });
      });

      socket.on('stopTyping', (data) => {
        socket.broadcast.emit('stopTyping', {
          fromUserId: data.fromUserId,
          toUserId: data.toUserId
        });
      });

      // Message read
      socket.on('message-read', async (data) => {
        try {
          await queryHandler.markMessageAsRead(data.messageId);
          this.io.to(data.fromSocketId).emit('message-read', data);
        } catch (err) {
          console.error('❌ Error marking message as read:', err);
        }
      });

      // Logout
      socket.on('logout', async (data) => {
        try {
          await queryHandler.logout(data.userId);
          this.io.to(socket.id).emit('logout-response', {
            error: false,
            message: CONSTANTS.USER_LOGGED_OUT,
            userId: data.userId
          });

          socket.broadcast.emit('chat-list-response', {
            error: false,
            userDisconnected: true,
            userid: data.userId
          });
        } catch (error) {
          console.error('❌ Logout error:', error);
          this.io.to(socket.id).emit('logout-response', {
            error: true,
            message: CONSTANTS.SERVER_ERROR_MESSAGE,
            userId: data.userId
          });
        }
      });

      // Disconnect event
      socket.on('disconnect', () => {
        console.log(`❎ Disconnected: ${socket?.request?._query?.['userId'] || 'unknown'}`);
        socket.broadcast.emit('chat-list-response', {
          error: false,
          userDisconnected: true,
          userid: socket?.request?._query?.['userId']
        });
      });
    });
  }

  socketConfig() {
    this.io.use(async (socket, next) => {
      try {
        await queryHandler.addSocketId({
          userId: socket.request._query['userId'],
          socketId: socket.id
        });
        next();
      } catch (error) {
        console.error('❌ Socket auth failed:', error);
      }
    });

    this.socketEvents();
  }
}

module.exports = Socket;
