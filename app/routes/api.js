var User = require('../models/user');
var Goal = require('../models/goal');

var config = require('../../config');
var secretKey = config.secretKey;

var jsonwebtoken = require('jsonwebtoken');
var nodemailer = require('nodemailer');

function createToken(user) {
	console.log(user);
	var token = jsonwebtoken.sign({
		id: user._id
	}, secretKey, {
		expiresIn: 1440
	});

	return token;
}

module.exports = function(app, express) {
	var api = express.Router();

	api.post('/createUser', function(req, res) {
		var user = new User({
			name: req.body.name,
			username: req.body.username,
			email: req.body.email,
			password: req.body.password,
			location: req.body.location,
			age: req.body.age
		});
		user.save(function(err) {
			if (err) {
				res.send(err);
				return;
			} else {
				console.log('sent');
				res.json({
					success: true,
					message: 'User has been created'
				});
			}
		});
	});

	/*api.get('/getUsers', function(req, res) {
		User.find({}, function(err, users) {
			if (err) {
				res.send(err);
				return;
			}
			res.json(users);
		});
	});*/

	api.post('/login', function(req, res) {
		User.findOne({
			email: req.body.email
		}).select('password').exec(function(err, user) {
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
					///token
					var token = createToken(user);
					// console.log(user);
					res.json({
						success: true,
						message: 'Successfully login !',
						token: token,
						userId: user._id
					});
				}
			}
		});
	});

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

	api.get('/getProfile', function(req, res) {
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
	});

	api.post('/createGoal', function(req, res) {
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

						var emailId = user.email;

						var smtpTransport = nodemailer.createTransport({
							service: "gmail",
							secure: false,
							port: 25,
							auth: {
								user: 'peer.exercise@gmail.com',
								pass: 'peer123456'
							},
							tls: {
								rejectUnauthorized: false
							}
						});

						var mailOptions = {
							from: '"Peer Network" <peer.exercise@gmail.com',
							to: emailId,
							subject: 'Goal Notification',
							text: 'Hi ' + user.name + ', thank you for setting up a goal on our app. You have to complete it by your specified deadline ie ' + req.body.deadline + '. Your goal title is ' + req.body.title + ' & its description: ' + req.body.description + '.'
						};

						smtpTransport.sendMail(mailOptions, function(err, res) {
							if (err) {
								console.log(err);
							} else {
								console.log("Message Sent:" + res.message);
							}
						});
					}
				});
			}
		});

	});

	return api;
};
