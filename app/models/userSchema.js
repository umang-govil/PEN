var mongoose = require('mongoose');

var Schema = mongoose.Schema;
var bcrypt = require('bcrypt-nodejs');

var UserSchema = new Schema({
	name: String,
	username: {
		type: String,
		required: true
	},
	email: {
		type: String,
		required: true,
		index: {
			unique: true
		}
	},
	location: {
		type: String,
		default: null
	},
	Followers: [{
		type: Schema.Types.ObjectId,
		ref: 'User',
		default: null
	}],
	Following: [{
		type: Schema.Types.ObjectId,
		ref: 'User',
		default: null
	}],
	age: {
		type: Number,
		default: 0
	},
	password: {
		type: String,
		required: true,
		select: false
	},
	confirmed: {
		type: Boolean,
		default: false
	},
	gender: {
		type: String,
		default: null
	},
	role: {
		type: Number,
		default: 1
	},
	goals: [{
		type: Schema.Types.ObjectId,
		ref: 'Goal'
	}]
}, {
	timestamps: true
});

UserSchema.pre('save', function(next) {
	var user = this;
	if (!user.isModified('password')) return next();

	bcrypt.hash(user.password, null, null, function(err, hash) {
		if (err) return next(err);

		user.password = hash;
		next();
	});
});

UserSchema.methods.comparePassword = function(password) {
	var user = this;
	return bcrypt.compareSync(password, user.password);
};

module.exports = mongoose.model('User', UserSchema);
