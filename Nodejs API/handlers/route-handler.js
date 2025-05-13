/**Nodejs API\handlers\route-handler.js */
'use strict';

const { validationResult } = require('express-validator');
const queryHandler = require('./../handlers/query-handler');
const CONSTANTS = require('./../config/constants');
const passwordHash = require('./../utils/password-hash');
const jwt = require('./../utils/jwt');

class RouteHandler {

  async userNameCheckHandler(request, response) {
    const username = request.body.username;
    if (username === "") {
      return response.status(CONSTANTS.SERVER_ERROR_HTTP_CODE).json({
        error: true,
        message: CONSTANTS.USERNAME_NOT_FOUND
      });
    }

    try {
      const count = await queryHandler.userNameCheck({ username: username.toLowerCase() });
      if (count > 0) {
        return response.status(200).json({
          error: true,
          message: CONSTANTS.USERNAME_AVAILABLE_FAILED
        });
      } else {
        return response.status(200).json({
          error: false,
          message: CONSTANTS.USERNAME_AVAILABLE_OK
        });
      }
    } catch (error) {
      return response.status(CONSTANTS.SERVER_ERROR_HTTP_CODE).json({
        error: true,
        message: CONSTANTS.SERVER_ERROR_MESSAGE
      });
    }
  }

  async loginRouteHandler(request, response) {
    const errors = validationResult(request);
    if (!errors.isEmpty()) {
      return response.status(400).json({
        error: true,
        message: errors.array()[0].msg
      });
    }

    const data = {
      username: request.body.username.toLowerCase(),
      password: request.body.password
    };

    try {
      const result = await queryHandler.getUserByUsername(data.username);
      if (!result) {
        return response.status(CONSTANTS.SERVER_NOT_FOUND_HTTP_CODE).json({
          error: true,
          message: CONSTANTS.USER_LOGIN_FAILED
        });
      }

      if (passwordHash.compareHash(data.password, result.password)) {
        await queryHandler.makeUserOnline(result._id);
        const token = jwt.generateToken({ userId: result._id });

        return response.status(CONSTANTS.SERVER_OK_HTTP_CODE).json({
          error: false,
          userId: result._id,
          token,
          message: CONSTANTS.USER_LOGIN_OK
        });
      } else {
        return response.status(CONSTANTS.SERVER_NOT_FOUND_HTTP_CODE).json({
          error: true,
          message: CONSTANTS.USER_LOGIN_FAILED
        });
      }
    } catch (error) {
      return response.status(CONSTANTS.SERVER_ERROR_HTTP_CODE).json({
        error: true,
        message: CONSTANTS.SERVER_ERROR_MESSAGE
      });
    }
  }

  async registerRouteHandler(request, response) {
    const errors = validationResult(request);
    if (!errors.isEmpty()) {
      return response.status(400).json({
        error: true,
        message: errors.array()[0].msg
      });
    }

    const data = {
      username: request.body.username.toLowerCase(),
      password: request.body.password
    };

    try {
      data.online = 'Y';
      data.socketId = '';
      data.password = passwordHash.createHash(data.password);

      const result = await queryHandler.registerUser(data);
      if (!result) {
        return response.status(CONSTANTS.SERVER_OK_HTTP_CODE).json({
          error: false,
          message: CONSTANTS.USER_REGISTRATION_FAILED
        });
      } else {
        return response.status(CONSTANTS.SERVER_OK_HTTP_CODE).json({
          error: false,
          userId: result.insertedId,
          message: CONSTANTS.USER_REGISTRATION_OK
        });
      }
    } catch (error) {
      return response.status(CONSTANTS.SERVER_NOT_FOUND_HTTP_CODE).json({
        error: true,
        message: CONSTANTS.SERVER_ERROR_MESSAGE
      });
    }
  }

  async userSessionCheckRouteHandler(request, response) {
    const userId = request.body.userId;
    if (userId === '') {
      return response.status(CONSTANTS.SERVER_ERROR_HTTP_CODE).json({
        error: true,
        message: CONSTANTS.USERID_NOT_FOUND
      });
    }

    try {
      const result = await queryHandler.userSessionCheck({ userId });
      return response.status(CONSTANTS.SERVER_OK_HTTP_CODE).json({
        error: false,
        username: result.username,
        message: CONSTANTS.USER_LOGIN_OK
      });
    } catch (error) {
      return response.status(CONSTANTS.SERVER_NOT_ALLOWED_HTTP_CODE).json({
        error: true,
        message: CONSTANTS.USER_NOT_LOGGED_IN
      });
    }
  }

  async getMessagesRouteHandler(request, response) {
    const userId = request.body.userId;
    const toUserId = request.body.toUserId;

    if (userId === '') {
      return response.status(CONSTANTS.SERVER_ERROR_HTTP_CODE).json({
        error: true,
        message: CONSTANTS.USERID_NOT_FOUND
      });
    }

    try {
      const messagesResponse = await queryHandler.getMessages({ userId, toUserId });
      return response.status(CONSTANTS.SERVER_OK_HTTP_CODE).json({
        error: false,
        messages: messagesResponse
      });
    } catch (error) {
      return response.status(CONSTANTS.SERVER_NOT_ALLOWED_HTTP_CODE).json({
        error: true,
        messages: CONSTANTS.USER_NOT_LOGGED_IN
      });
    }
  }

  routeNotFoundHandler(request, response) {
    return response.status(CONSTANTS.SERVER_NOT_FOUND_HTTP_CODE).json({
      error: true,
      message: CONSTANTS.ROUTE_NOT_FOUND
    });
  }
}

module.exports = new RouteHandler();
