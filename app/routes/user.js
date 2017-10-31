var User = require('../models/userSchema');
var Goal = require('../models/goalSchema');

var express = require('express');

var api = express.Router();
var mongoose = require('mongoose');

var https = require('https');

api.getProfile = function(req, res) {
	var userId = req.decoded.id;
	User.findOne({
		_id: userId
	}).populate('goals').exec(function(err, user) {
		if (err) throw err;

		if (!user) {
			res.send({
				message: "User doesn't exist"
			});
		} else if (user) {

			var goalCount = user.goals.length;
			console.log("profile sent");
			res.json({
				success: true,
				data: user,
				goalCount: goalCount
			});
		}
	});
};

api.createGoal = function(req, res) {
	var goal = new Goal({
		userId: req.decoded.id,
		title: req.body.title,
		description: req.body.description,
		milestones: req.body.milestones,
		deadline: req.body.deadline
	});

	goal.save(function(err, data) {
		if (err) {
			res.send(err);
			return;
		} else {
			res.json({
				success: true,
				message: "Goal created succesfully !"
			});

			User.findOne({
				_id: req.decoded.id
			}, function(err, user) {
				if (err) throw err;

				if (!user) {
					console.log("Invalid User");
				} else {

					user.goals.push(data._id);

					user.save(function(err) {
						if (err) throw err;
					});

					var mailObject = JSON.stringify({
						email: user.email,
						name: user.name,
						title: req.body.title,
						description: req.body.description,
						deadline: req.body.deadline,
						subject: 'Goal Notification',
						content: 'Hi ' + user.name + ', thank you for setting up a goal on our app. You have to complete it by your specified deadline ie ' + req.body.deadline + '. Your goal title is ' + req.body.title + ' & its description: ' + req.body.description + '.'
					});

					var postheaders = {
						'Content-Type': 'application/json',
						'Content-Length': Buffer.byteLength(mailObject, 'utf8')
					};

					var optionspost = {
						host: 'send-mailer.herokuapp.com',
						path: '/api/sendMail',
						method: 'POST',
						headers: postheaders
					};

					var send = https.request(optionspost, function(res) {

						res.on('data', function(d) {
							console.info('POST result:\n');
							process.stdout.write(d);
							console.info('\n\nPOST completed');
						});
					});

					send.write(mailObject);
					send.end();
					send.on('error', function(e) {
						console.error(e);
					});
				}
			});
		}
	});
};



module.exports = api;
