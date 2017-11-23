var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var GoalSchema = new Schema({
	userId: {
		type: Schema.Types.ObjectId,
		ref: 'User'
	},
	goalType: {
		type: String,
		required: true
	},
	goalStatus: {
		type: Boolean,
		default: false
	},
	title: {
		type: String,
		required: true
	},
	description: {
		type: String,
		required: true
	},
	milestoneCount: {
		type: Number,
		required: true
	},
	milestones: [{
		mileTitle: {
			type: String,
			required: true
		},
		mileStatus: {
			type: Boolean,
			default: false
		}
	}],
	deadline: {
		type: String,
		required: true
	}
}, {
	timestamps: true
});

module.exports = mongoose.model('Goal', GoalSchema);
