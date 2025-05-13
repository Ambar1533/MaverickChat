	/*
* Real time private chatting app using Angular 2, Nodejs, mongodb and Socket.io
* @author Shashank Tiwari
*/
 // Nodejs API/config/db.js

'use strict';

const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config(); // ✅ Ensure .env variables are loaded

const mongoURL = process.env.DB_URL;
let _db = null;

class Db {
  constructor() {
    this.ObjectID = ObjectId;
  }

  async connect() {
    if (_db) {
      return _db;
    }

    try {
      const client = await MongoClient.connect(mongoURL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        maxPoolSize: 10, // ✅ Controls connection pool size
      });

      _db = client.db(); // ✅ Automatically uses DB from connection string
      console.log('✅ MongoDB connected successfully.');
      return _db;
    } catch (err) {
      console.error('❌ MongoDB connection error:', err.message);
      throw err;
    }
  }

  getObjectID() {
    return this.ObjectID;
  }
}

module.exports = new Db();
