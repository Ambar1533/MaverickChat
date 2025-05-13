/** Nodejs API/web/routes.js */
'use strict';

const { body } = require('express-validator');
const path = require('path');
const routeHandler = require('./../handlers/route-handler');
const authMiddleware = require('../middleware/auth');
const validateRequest = require('../middleware/validateRequest');
const { loginRateLimiter } = require('../middleware/rateLimiter');
const upload = require('../middleware/upload'); // ✅ Multer middleware

class Routes {
	constructor(app) {
		this.app = app;
	}

	appRoutes() {
		// Username availability check
		this.app.post('/usernameAvailable', routeHandler.userNameCheckHandler);

		// Register route with validation
		this.app.post(
			'/register',
			[
				body('username')
					.trim()
					.notEmpty()
					.withMessage('Username is required')
					.isLength({ min: 3 })
					.withMessage('Username must be at least 3 characters'),
				body('password')
					.notEmpty()
					.withMessage('Password is required')
					.isLength({ min: 6 })
					.withMessage('Password must be at least 6 characters'),
			],
			validateRequest,
			routeHandler.registerRouteHandler
		);

		// Login route with rate limiter + validation
		this.app.post(
			'/login',
			loginRateLimiter,
			[
				body('username')
					.trim()
					.notEmpty()
					.withMessage('Username is required'),
				body('password')
					.notEmpty()
					.withMessage('Password is required'),
			],
			validateRequest,
			routeHandler.loginRouteHandler
		);

		// ✅ File Upload Route with metadata
		this.app.post(
			'/upload',
			upload.single('image'), // Field name should be "image"
			(req, res) => {
				if (!req.file) {
					return res.status(400).json({ error: true, message: 'No file uploaded' });
				}

				const imageUrl = `/uploads/${req.file.filename}`;
				const fileType = req.file.mimetype;
				const fileName = req.file.originalname;

				res.status(200).json({
					error: false,
					message: 'Upload successful',
					imageUrl,
					isFile: true,
					fileType,
					fileName
				});
			}
		);

		// Protected routes
		this.app.post(
			'/userSessionCheck',
			authMiddleware,
			routeHandler.userSessionCheckRouteHandler
		);

		this.app.post(
			'/getMessages',
			authMiddleware,
			routeHandler.getMessagesRouteHandler
		);

		// Fallback route
		this.app.get('*', routeHandler.routeNotFoundHandler);
	}

	routesConfig() {
		this.appRoutes();
	}
}

module.exports = Routes;
