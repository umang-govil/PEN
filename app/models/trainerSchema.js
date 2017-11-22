var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var TrainerSchema = new Schema({
	userId: [{
		type: Schema.Types.ObjectId,
		ref: 'User',
		default: null
	}],
	name: {
		type: String
	},
	age: {
		type: Number
	},
	address: {
		type: String
	},
	experience: {
		type: String
	},
	gender: {
		type: String
	}
}, {
	timestamps: true
});

module.exports = mongoose.model('Trainer', TrainerSchema);
