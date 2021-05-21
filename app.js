var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var cors = require('cors')
const config = require('./config');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var devicesRouter = require('./routes/devices');
var roomsRouter = require('./routes/rooms');
var functionsRouter = require('./routes/functions');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors({
  // Sets Access-Control-Allow-Origin to the UI URI
  origin: config.UI_ROOT_URI,
  // Sets Access-Control-Allow-Credentials to true
  credentials: true,
})
);

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/devices', devicesRouter);
app.use("/rooms", roomsRouter)
app.use("/functions", functionsRouter)

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
});

module.exports = app;
