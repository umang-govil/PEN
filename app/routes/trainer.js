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
	var trainers = req.body;
	var trainersList = [];
	var trainerCount = trainers.length;

	for (var i = 0; i < trainerCount; i++) {
		if (trainers[i].approved) {
			trainersList.push(trainers[i]._id);
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

module.exports = api;
