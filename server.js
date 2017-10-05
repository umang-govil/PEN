var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var morgan = require('morgan');
var config = require('./config');
var mongoose = require('mongoose');
var cors = require('cors');
var app = express();

var options = {
	server: {
		socketOptions: {
			keepAlive: 300000,
			connectTimeoutMS: 30000
		}
	}
};

mongoose.connect(config.database, options, function(err) {
	if (err) {
		console.log(err);
	} else {
		console.log("Connected to the database");
	}
});

app.use(cors({
	origin: 'http://localhost:4200'
}));

app.use(bodyParser.urlencoded({
	extended: false
}));
app.use(bodyParser.json());
app.use(morgan('dev'));

app.use(express.static(path.join(__dirname, 'public')));


var api = require('./app/routes/api')(app, express);
app.use('/api', api);

app.get('/*', function(req, res) {
	res.sendFile(path.join(__dirname + '/public/index.html'));
});

// catch 404 and forward to error handler.
app.use(function(req, res, next) {
	var err = new Error('Not Found');
	err.status = 404;
	next(err);
});

// If our applicatione encounters an error, we'll display the error and stacktrace accordingly.
app.use(function(err, req, res, next) {
	res.status(err.status || 500);
	res.send(err);
});

app.listen(config.port, function(err) {
	if (err) {
		console.log(err);
	} else {
		console.log("Listening on port 3000");
	}
});
