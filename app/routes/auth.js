var User = require('../models/userSchema');
var Goal = require('../models/goalSchema');

var express = require('express');

var api = express.Router();
var mongoose = require('mongoose');

var config = require('../../config');
var secretKey = config.secretKey;

var jsonwebtoken = require('jsonwebtoken');
var https = require('https');

function createToken(user) {
	console.log(user);
	var token = jsonwebtoken.sign({
		id: user._id
			/*,
					email: user.email*/
	}, secretKey, {
		expiresIn: 1440
	});

	return token;
}

api.createUser = function(req, res) {
	var user = new User({
		name: req.body.name,
		username: req.body.username,
		email: req.body.email,
		password: req.body.password
	});
	user.save(function(err) {
		if (err) {
			res.send(err);
			return;
		} else {

			var tokenConfirm = createToken(user);
			console.log(tokenConfirm);

			var confirmMailObject = JSON.stringify({
				email: req.body.email,
				name: req.body.name,
				subject: 'Confirm Email',
				content: 'Please confirm your email by clicking on this link http://localhost:8080/api/confirmation/' + tokenConfirm
			});

			var confirmPostHeaders = {
				'Content-Type': 'application/json',
				'Content-Length': Buffer.byteLength(confirmMailObject, 'utf8')
			};

			var confirmOptionsPost = {
				host: 'send-mailer.herokuapp.com',
				path: '/api/sendMail',
				method: 'POST',
				headers: confirmPostHeaders
			};

			var confirmSend = https.request(confirmOptionsPost, function(res) {
				res.on('data', function(d) {
					console.info('POST result:\n');
					process.stdout.write(d);
					console.info('\n\nPOST completed');
				});
			});

			confirmSend.write(confirmMailObject);
			confirmSend.end();
			confirmSend.on('error', function(e) {
				console.error(e);
			});
			res.json({
				success: true,
				message: 'User has been created'
			});
		}
	});
};

api.confirm = function(req, res) {
	var confirmToken = req.params.token;
	jsonwebtoken.verify(confirmToken, secretKey, function(err, decoded) {
		if (err) {
			res.status(403).send({
				success: false,
				message: 'Failed to authenticate User'
			});
		} else {
			req.decoded = decoded;
			User.findOne({
				'_id': req.decoded.id
			}, function(err, user) {
				if (err) throw err;

				if (!user) {
					res.send({
						message: "User doesn't exist"
					});
				} else if (user) {
					user.confirmed = true;
					// console.log(user);
					user.save(function(err) {
						if (err) throw err;
					});
				}
			});
		}
	});
	return res.redirect('http://localhost:8080');
};

api.login = function(req, res) {
	User.findOne({
		email: req.body.email,
		role: req.body.role
	}).select('_id name email confirmed location age gender role +password').exec(function(err, user) {
		if (err) throw err;

		if (!user) {
			res.send({
				message: "User doesn't exist"
			});
		} else if (user) {
			// console.log(user);
			var validPassword = user.comparePassword(req.body.password);
			if (!validPassword) {
				res.send({
					message: 'Invalid Password'
				});
			} else {
				if (user.confirmed) {
					///token
					var token = createToken(user);
					// console.log(user);
					if (user.location === null && user.role == 1) {
						res.json({
							success: true,
							status: 1,
							message: 'Login Successful, complete your details!',
							token: token,
							userId: user._id
						});
					} else if (user.location !== null && user.role == 1) {
						res.json({
							success: true,
							status: 2,
							message: 'Login Successful!',
							token: token,
							userId: user._id
						});
					} else if (user.role === 0) {
						res.json({
							success: true,
							status: 3,
							message: 'Login Successful, welcome Admin',
							token: token,
							userId: user._id
						});
					}
				} else if (!user.confirmed) {
					res.send({
						message: 'Confirm your e-mail to login'
					});
				}
			}
		}
	});
};

api.completeUser = function(req, res) {
	User.findOne({
		_id: req.decoded.id
	}, function(err, user) {

		if (err) throw err;

		if (!user) {
			console.log("Invalid User");
		} else if (user) {
			user.location = req.body.location;
			user.age = req.body.age;
			user.gender = req.body.gender;

			user.save(function(err) {
				if (err) throw err;
			});

			res.json({
				success: true,
				message: 'User Details have been completed'
			});
		}
	});
};

api.viewGoals =

	module.exports = api;
