/*
* Real time private chatting app using Angular 2, Nodejs, mongodb and Socket.io
* @author Shashank Tiwari
*/
/**Nodejs API\handlers\query-handler.js */
'use strict';

class QueryHandler {
  constructor() {
    this.Mongodb = require('./../config/db');
  }

  async userNameCheck(data) {
    try {
      const DB = await this.Mongodb.connect();
      return await DB.collection('users').find(data).count();
    } catch (error) {
      throw error;
    }
  }

  async getUserByUsername(username) {
    try {
      const DB = await this.Mongodb.connect();
      const result = await DB.collection('users').find({ username }).toArray();
      return result[0];
    } catch (error) {
      throw error;
    }
  }

  async makeUserOnline(userId) {
    try {
      const DB = await this.Mongodb.connect();
      const ObjectID = this.Mongodb.getObjectID();
      const result = await DB.collection('users').findOneAndUpdate(
        { _id: ObjectID(userId) },
        { $set: { online: 'Y' } },
        { returnOriginal: false, upsert: true }
      );
      return result.value;
    } catch (error) {
      throw error;
    }
  }

  async registerUser(data) {
    try {
      const DB = await this.Mongodb.connect();
      return await DB.collection('users').insertOne(data);
    } catch (error) {
      throw error;
    }
  }

  async userSessionCheck(data) {
    try {
      const DB = await this.Mongodb.connect();
      const ObjectID = this.Mongodb.getObjectID();
      return await DB.collection('users').findOne({ _id: ObjectID(data.userId), online: 'Y' });
    } catch (error) {
      throw error;
    }
  }

  async getUserInfo({ userId, socketId = false }) {
    try {
      const DB = await this.Mongodb.connect();
      const ObjectID = this.Mongodb.getObjectID();
      const projection = socketId
        ? { socketId: true }
        : { username: true, online: true, _id: false, id: '$_id' };

      const result = await DB.collection('users').aggregate([
        { $match: { _id: ObjectID(userId) } },
        { $project: projection }
      ]).toArray();

      return socketId ? result[0]?.socketId : result;
    } catch (error) {
      throw error;
    }
  }

  async addSocketId({ userId, socketId }) {
    try {
      const DB = await this.Mongodb.connect();
      const ObjectID = this.Mongodb.getObjectID();
      return await DB.collection('users').updateOne(
        { _id: ObjectID(userId) },
        {
          $set: {
            socketId,
            online: 'Y'
          }
        }
      );
    } catch (error) {
      throw error;
    }
  }

  async getChatList(userId) {
    try {
      const DB = await this.Mongodb.connect();
      return await DB.collection('users').aggregate([
        { $match: { socketId: { $ne: userId } } },
        {
          $project: {
            username: true,
            online: true,
            _id: false,
            id: '$_id'
          }
        }
      ]).toArray();
    } catch (error) {
      throw error;
    }
  }

  async insertMessages(data) {
    try {
      const DB = await this.Mongodb.connect();

      const message = {
        fromUserId: data.fromUserId,
        toUserId: data.toUserId,
        message: data.message,
        timestamp: new Date(),
        read: false,
        isFile: data.isFile || false,
        fileType: null,
        fileName: null
      };

      if (data.isFile && data.message) {
        try {
          const urlParts = data.message.split('/');
          message.fileName = urlParts[urlParts.length - 1];
          message.fileType = message.fileName.split('.').pop() || 'unknown';
        } catch (err) {
          console.error('⚠️ Failed to extract file metadata:', err);
        }
      }

      console.log('📩 Inserting message into DB:', message); // Debug log

      const result = await DB.collection('messages').insertOne(message);
      return result.insertedId;
    } catch (error) {
      console.error('❌ Error in insertMessages:', error);
      throw error;
    }
  }

  async getMessages({ userId, toUserId }) {
    try {
      const DB = await this.Mongodb.connect();
      return await DB.collection('messages')
        .find({
          $or: [
            { $and: [{ toUserId: userId }, { fromUserId: toUserId }] },
            { $and: [{ toUserId: toUserId }, { fromUserId: userId }] }
          ]
        })
        .sort({ timestamp: 1 })
        .toArray();
    } catch (error) {
      throw error;
    }
  }

  async logout(userID, isSocketId) {
    try {
      const DB = await this.Mongodb.connect();
      const ObjectID = this.Mongodb.getObjectID();
      const condition = isSocketId
        ? { socketId: userID }
        : { _id: ObjectID(userID) };

      return await DB.collection('users').updateOne(
        condition,
        { $set: { online: 'N' } }
      );
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new QueryHandler();
