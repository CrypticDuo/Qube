var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var session = require('express-session');
var methodOverride = require('method-override');
var passport = require('passport');

var app = express();
var router = express.Router();

// configuration ===============================================================
// connect to the database
mongoose.connect('mongodb://localhost/database');
app.set("view options", {
    layout: false
});

app.use("/static", express.static(__dirname + "/static"));
app.use("/bower_components", express.static(__dirname + "/bower_components"));
app.use("/template", express.static(__dirname + "/views/app"));
app.set('views', __dirname + '/views');
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'ejs');
app.set('port', process.env.PORT || 80);

// passport ====================================================================
app.use(session({
    secret: 'my_precious'
}));
app.use(passport.initialize());
app.use(passport.session());

app.use(bodyParser.urlencoded({'extended':'true'}));            // parse application/x-www-form-urlencoded
app.use(bodyParser.json());                                     // parse application/json
app.use(bodyParser.json({ type: 'application/vnd.api+json' })); // parse application/vnd.api+json as json
app.use(methodOverride());
// routes ======================================================================
require('./app/routes')(app, router);
require('./app/passport')(app);

// listen ======================================================================
app.listen(app.get('port'));
console.log("Listening on port localhost:" + app.get('port'));
