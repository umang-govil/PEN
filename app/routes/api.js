var express = require('express');

var user = require('./user');
var auth = require('./auth');

var config = require('../../config');
var secretKey = config.secretKey;

var jsonwebtoken = require('jsonwebtoken');
var https = require('https');

var api = express.Router();

api.post('/createUser', auth.createUser);

api.get('/confirmation/:token', auth.confirm);

api.post('/login', auth.login);

api.use(function(req, res, next) {

	console.log("in the middleware");
	console.log(req.body);
	console.log(req.headers.authorization);
	var token = req.body.token || req.headers.authorization;

	//check if token exists
	if (token) {
		jsonwebtoken.verify(token, secretKey, function(err, decoded) {
			if (err) {
				res.status(403).send({
					success: false,
					message: 'Failed to authenticate User'
				});
			} else {
				req.decoded = decoded;
				next();
			}
		});
	} else {
		res.status(403).send({
			success: false,
			message: 'No token provided'
		});
	}
});

api.get('/getProfile', user.getProfile);

api.post('/createGoal', user.createGoal);

module.exports = api;
