var User = require('../models/user');
var Goal = require('../models/goal');

var config = require('../../config');
var secretKey = config.secretKey;

var jsonwebtoken = require('jsonwebtoken');

function createToken(user) {
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
			email: req.body.email,
			password: req.body.password
		});
		user.save(function(err) {
			if (err) {
				res.send(err);
				return;
			}
			res.json({
				message: 'User has been created'
			});
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
		}, function(err, user) {
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
					var userDetail = user;
					userDetail.password = undefined;

					res.json({
						success: true,
						message: 'Successfully login !',
						token: token,
						data: userDetail
					});
				}
			}
		});
	});

	api.use(function(req, res, next) {

		console.log("in the middleware");
		var token = req.body.token || req.param('token') || req.headers['x-access-token'];

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

	api.post('/createGoal', function(req, res) {
		var goal = new Goal({
			userId: req.decoded.id,
			title: req.body.title,
			milestones: req.body.milestones,
			deadline: req.body.deadline
		});
		goal.save(function(err) {
			if (err) {
				res.send(err);
				return;
			} else {
				res.json({
					success: true,
					message: "Goal created succesfully !"
				});
			}
		});
	});

	return api;
};
