var Trainer = require('../models/trainerSchema');

var express = require('express');

var api = express.Router();
var mongoose = require('mongoose');

api.createTrainer = function(req, res) {
	var trainer = new Trainer({
		name: req.body.name,
		age: req.body.age,
		address: req.body.address,
		experience: req.body.experience,
		gender: req.body.gender
	});

	trainer.save(function(err, data) {
		if (err) throw err;
		else {
			res.json({
				success: true,
				message: 'Trainer Created'
			});
		}
	});
};

api.getTrainers = function(req, res) {
	Traine.find({}, function(err, trainers) {
		if (err) {
			res.send(err);
			return;
		}
		res.json(trainers);
	});
};
