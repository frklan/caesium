'use strict'

var express = require('express');
var path = require('path');
var logger = require('morgan');
var bodyParser = require('body-parser');
var apiv1 = require('./routes/api/v1/api');
const login = require('./routes/login');

var app = express();


app.use(logger('common'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.disable('x-powered-by');

app.use('/login', login);
app.use('/api/v1', apiv1);

// catch 404 and forward to error handler
// app.use(function(req, res, next) {
//   var err = new Error('Not Found');
//   err.status = 404;
//   next(err);
// });

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  //res.render('error');
  res.end(JSON.stringify(err));
});

module.exports = app;
