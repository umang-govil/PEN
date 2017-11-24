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
		if (err) {
			res.send(err);
			return;
		} else if (!user) {
			res.send({
				message: "User doesn't exist"
			});
			return;
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
		goalType: req.body.goalType,
		description: req.body.description,
		milestoneCount: req.body.milestones,
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

					//////sendMail api on Heroku///////

					var mailObject = JSON.stringify({
						email: user.email,
						name: user.name,
						title: req.body.title,
						description: req.body.description,
						deadline: req.body.deadline,
						subject: 'Goal Notification',
						content: 'Hi ' + user.name + ', thank you for setting up a goal on our app. You have to complete it by your specified deadline ie. ' + req.body.deadline + '. Your goal title is ' + req.body.title + 'and its type is' + req.body.goalType + ' & its description is ' + req.body.description + '.'
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

					//////ScheduleMail Api on Heroku///////

					var scheduleMailObject = JSON.stringify({
						email: user.email,
						name: user.name,
						deadline: req.body.deadline,
						title: req.body.title,
						milestones: req.body.milestones,
						subject: 'Goal Reminder',
						content: "Hi " + user.name + ", the deadline for your goal is approaching. Are you slacking off because your peers aren't !!"
					});

					var scheduleMailPostHeaders = {
						'Content-Type': 'application/json',
						'Content-Length': Buffer.byteLength(scheduleMailObject, 'utf8')
					};

					var scheduleMailOptionsPost = {
						host: 'send-mailer.herokuapp.com',
						path: '/api/scheduleMail',
						method: 'POST',
						headers: scheduleMailPostHeaders
					};

					var schedule = https.request(scheduleMailOptionsPost, function(res) {

						res.on('data', function(d) {
							console.info('POST result:\n');
							process.stdout.write(d);
							console.info('\n\nPOST completed');
						});
					});

					schedule.write(scheduleMailObject);
					schedule.end();
					schedule.on('error', function(e) {
						console.error(e);
					});
				}
			});
		}
	});
};

api.searchUsers = function(req, res) {

	var searchLoc = req.body.location;
	var lowCaseLoc = searchLoc.toLowerCase();

	User.find({
		location: lowCaseLoc
	}).populate({
		path: 'goals',
		match: {
			goalType: req.body.goalType
		}
	}).exec(function(err, users) {
		if (err) {
			res.send(err);
			return;
		} else if (!users) {
			res.send({
				message: 'Users Not Found'
			});
			return;
		} else if (users) {
			res.json(users);
		}
	});

};

api.getParticularProfile = function(req, res) {
	User.findOne({
		_id: req.body.userId
	}).populate('goals').exec(function(err, user) {
		if (err) {
			res.send(err);
			return;
		} else if (!user) {
			res.send({
				message: "User doesn't exist"
			});
			return;
		} else if (user) {
			res.json(user);
		}
	});
};

api.followUser = function(req, res) {
	User.findOne({
		_id: req.body.userId
	}, function(err, user) {
		if (err) {
			res.send(err);
			return;
		} else if (!user) {
			res.send({
				message: "User doesn't exist"
			});
			return;
		} else if (user) {
			user.Followers.push(req.decoded.id);

			user.save(function(err) {
				if (err) {
					res.send(err);
					return;
				} else {
					User.findOne({
						_id: req.decoded.id
					}, function(err, user) {
						if (err) {
							res.send(err);
							return;
						} else if (!user) {
							res.send({
								message: "User doesn't exist"
							});
							return;
						} else if (user) {
							user.Following.push(req.body.userId);
							res.json({
								success: true,
								message: 'User Followed'
							});
						}
					});
				}
			});
		}
	});
};

api.completeGoal = function(req, res) {

	Goal.find({
		_id: {
			$in: req.body.goalsStatus
		}
	}, function(err, goals) {
		if (err) {
			res.send(err);
			return;
		} else if (!goals) {
			res.send({
				message: "Goal doesn't exist"
			});
			return;
		} else if (goals) {
			for (var i = 0; i < goals.length; i++) {
				goals[i].goalStatus = true;
			}
			goals.forEach(function(goal) {
				goal.save(function(err) {
					if (err) {
						res.send(err);
						return;
					}
				});
			});
			res.json({
				success: true,
				message: 'Goal status changed to completed'
			});
		}
	});
};

api.dummyCompleteGoal = function(req, res) {
	User.findOne({
		_id: req.body.userId
	}).populate('goals').exec(function(err, users) {
		var goalCount = users.goals.length;
		var goalResponse = users.goals;
		var goalsList = [];
		for (var i = 0; i < goalCount; i++) {
			goalsList.push(goalResponse[i]._id);
		}
	});

	Goal.find({
		_id: {
			$in: goalsList
		}
	}, function(err, goals) {
		if (err) {
			res.send(err);
			return;
		} else if (!goals) {
			res.send({
				message: 'Goals not find'
			});
		} else if (goals) {
			for (var i = 0; i < goals.length; i++) {
				goals[i].goalStatus = true;
			}
			goals.forEach(function(goal) {
				goal.save(function(err) {
					if (err) {
						res.send(err);
						return;
					}
				});
			});

		}
	});
	Goal.find({
		_id: {
			$in: goalsList
		}
	}, function(err, goals) {
		if (err) {
			res.send(err);
			return;
		} else if (!goals) {
			res.send({
				message: 'Goals not found'
			});
		} else if (goals) {
			res.json({
				data: goals,
				message: 'Goal Status Changed to Completed'
			});
		}
	});
};

module.exports = api;
