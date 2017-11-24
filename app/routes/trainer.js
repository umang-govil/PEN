var Trainer = require('../models/trainerSchema');

var express = require('express');

var api = express.Router();
var mongoose = require('mongoose');

api.createTrainer = function(req, res) {
	var trainer = new Trainer({
		name: req.body.name,
		age: req.body.age,
		email: req.body.email,
		experience: req.body.experience,
		gender: req.body.gender
	});

	trainer.save(function(err, data) {
		if (err) throw err;
		else {
			res.json({
				success: true,
				message: 'Application Submitted'
			});
		}
	});
};

api.getTrainers = function(req, res) {
	Trainer.find({}, function(err, trainers) {
		if (err) {
			res.send(err);
			return;
		}
		res.json(trainers);
	});
};

api.approveTrainers = function(req, res) {
	var response = req.body;
	console.log(response);
	var trainersList = [];
	var trainerCount = response.length;

	for (var i = 0; i < trainerCount; i++) {
		if (response[i].approved) {
			trainersList.push(response[i]._id);
		}
	}
	Trainer.find({
		_id: {
			$in: trainersList
		}
	}, function(err, trainers) {
		if (err) {
			res.send(err);
			return;
		} else if (!trainers) {
			res.send({
				message: "Trainer doesn't exist"
			});
			return;
		} else if (trainers) {
<<<<<<< HEAD
=======
			for (var i = 0; i < trainers.length; i++) {
				trainers[i].approved = true;
			}
>>>>>>> refs/remotes/origin/master
			trainers.forEach(function(trainer) {
				trainer.save(function(err) {
					if (err) {
						res.send(err);
						return;
					}
				});
			});
			res.json({
				success: true,
				message: 'Trainer Approved'
			});
		}
	});
};

api.getApprovedTrainers = function(req, res) {
	Trainer.find({
		approved: true
	}, function(err, trainers) {
		if (err) {
			res.send(err);
			return;
		} else if (!trainers) {
			res.send({
				message: 'Trainers not found'
			});
			return;
		} else if (trainers) {
			res.json(trainers);
		}
	});
};

module.exports = api;
