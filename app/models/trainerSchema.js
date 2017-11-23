var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var TrainerSchema = new Schema({
	userId: [{
		type: Schema.Types.ObjectId,
		ref: 'User',
		default: null
	}],
	name: {
		type: String,
		required: true
	},
	age: {
		type: Number,
		required: true
	},
	email: {
		type: String,
		required: true
	},
	approved: {
		type: Boolean,
		default: false
	},
	experience: {
		type: String,
		required: true
	},
	gender: {
		type: String,
		required: true
	}
}, {
	timestamps: true
});

module.exports = mongoose.model('Trainer', TrainerSchema);
