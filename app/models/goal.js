var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var GoalSchema = new Schema({
	userId: {
		type: Schema.Types.ObjectId,
		ref: 'User'
	},
	title: {
		type: String,
		required: true
	},
	description: {
		type: String,
		required: true
	},
	milestones: {
		type: Number,
		required: true
	},
	deadline: {
		type: String,
		required: true
	}
}, {
	timestamps: true
});

module.exports = mongoose.model('Goal', GoalSchema);
