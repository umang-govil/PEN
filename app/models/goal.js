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
	milestones: [{
		title: {
			type: String,
			required: true
		}
	}],
	created_at: {
		type: Date,
		default: Date.now
	},
	deadline: {
		type: Date,
		required: true,
		index: {
			unique: true
		}
	}
});

module.exports = mongoose.model('Goal', GoalSchema);
